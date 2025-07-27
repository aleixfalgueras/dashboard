import { prisma } from '@/lib/prisma'
import { InstagramProfile, InstagramPost, Prisma } from '@prisma/client'
import {logger} from "@/lib/utils";

export class InstagramRepository {
  // Profile operations
  async createInstagramProfile(data: Prisma.InstagramProfileCreateInput): Promise<InstagramProfile> {
    return prisma.instagramProfile.create({ data })
  }

  // Post operations
  async createInstagramPost(data: Prisma.InstagramPostCreateInput): Promise<InstagramPost> {
    return prisma.instagramPost.create({ data })
  }

  async createManyComments(data: Prisma.InstagramCommentCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return prisma.instagramComment.createMany({ data })
  }

  // Bulk operations for upload processing
  async createInstagramPostsWithComments(
    posts: Array<{
      post: Prisma.InstagramPostCreateManyInput
      comments: Prisma.InstagramCommentCreateManyInput[]
    }>
  ): Promise<void> {
    logger.info(`Proceed to create ${posts.length} Instagram posts`)

    // Create all posts in bulk
    const postsData = posts.map(({ post }) => post)
    await prisma.instagramPost.createMany({ data: postsData })

    // Get created posts to map comments
    const createdPosts = await prisma.instagramPost.findMany({
      where: {
        postId: { in: postsData.map(post => post.postId) }
      },
      select: { id: true, postId: true }
    })

    // Create postId lookup map
    const postIdMap = new Map(createdPosts.map(post => [post.postId, post.id]))

    // Prepare all comments with correct postId references
    const allComments: Prisma.InstagramCommentCreateManyInput[] = []
    posts.forEach(({ post, comments }) => {
      const dbPostId = postIdMap.get(post.postId)
      if (dbPostId && comments.length > 0) {
        const commentsWithPostId = comments.map(comment => ({
          ...comment,
          postId: dbPostId
        }))
        allComments.push(...commentsWithPostId)
      }
    })

    // Create all comments in bulk
    if (allComments.length > 0) {
      await this.createManyComments(allComments)
    }

    logger.info("Instagram posts created successfully")
  }

  // Find operations
  async findInstagramProfileByClientId(clientId: string): Promise<InstagramProfile | null> {
    return prisma.instagramProfile.findUnique({
      where: { clientId }
    })
  }

  // Delete operations
  async deleteInstagramProfileByClientId(clientId: string): Promise<InstagramProfile | null> {
    logger.info(`Attempting to delete Instagram profile for client ${clientId}`)
    
    // Check if profile exists first
    const existingProfile = await this.findInstagramProfileByClientId(clientId)
    
    if (!existingProfile) {
      logger.info(`No Instagram profile found for client ${clientId}, nothing to delete`)
      return null
    }
    
    const result = await prisma.instagramProfile.delete({
      where: {
        clientId: clientId
      }
    })
    
    logger.info(`Deleted Instagram profile for client ${clientId}`)
    return result
  }

  async deleteInstagramPostsByClientId(clientId: string): Promise<number> {
    logger.info(`Attempting to delete Instagram posts for client ${clientId}`)
    
    // Check if profile exists first
    const existingProfile = await this.findInstagramProfileByClientId(clientId)
    
    if (!existingProfile) {
      logger.info(`No Instagram profile found for client ${clientId}, nothing to delete`)
      return 0
    }
    
    const result = await prisma.instagramPost.deleteMany({
      where: {
        profileId: existingProfile.id
      }
    })
    
    logger.info(`Deleted ${result.count} Instagram posts for client ${clientId}`)
    return result.count
  }

}

// Export singleton instance
export const instagramRepository = new InstagramRepository()