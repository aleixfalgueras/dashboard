import { prisma } from '@/lib/prisma'
import { InstagramProfile, InstagramPost, Prisma } from '@prisma/client'

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
      post: Prisma.InstagramPostCreateInput
      comments: Prisma.InstagramCommentCreateManyInput[]
    }>
  ): Promise<void> {
    console.info(`Proceed to create ${posts.length} Instagram posts`)

    for (const { post, comments } of posts) {
      const createdPost = await this.createInstagramPost(post)
      
      if (comments.length > 0) {
        const commentsWithPostId = comments.map(comment => ({
          ...comment,
          postId: createdPost.id
        }))
        await this.createManyComments(commentsWithPostId)
      }
    }

    console.info("Instagram posts created successfully")
  }

  // Find operations
  async findInstagramProfileByClientId(clientId: string): Promise<InstagramProfile | null> {
    return prisma.instagramProfile.findUnique({
      where: { clientId }
    })
  }

}

// Export singleton instance
export const instagramRepository = new InstagramRepository()