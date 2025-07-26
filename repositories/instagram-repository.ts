import { prisma } from '@/lib/prisma'
import { InstagramProfile, InstagramPost, Prisma } from '@prisma/client'

export class InstagramRepository {
  // Profile operations
  async createProfile(data: Prisma.InstagramProfileCreateInput): Promise<InstagramProfile> {
    return prisma.instagramProfile.create({ data })
  }

  // Post operations
  async createPost(data: Prisma.InstagramPostCreateInput): Promise<InstagramPost> {
    return prisma.instagramPost.create({ data })
  }

  async createManyComments(data: Prisma.InstagramCommentCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return prisma.instagramComment.createMany({ data })
  }

  // Bulk operations for upload processing
  async createPostsWithComments(
    posts: Array<{
      post: Prisma.InstagramPostCreateInput
      comments: Prisma.InstagramCommentCreateManyInput[]
    }>
  ): Promise<void> {
    for (const { post, comments } of posts) {
      const createdPost = await this.createPost(post)
      
      if (comments.length > 0) {
        const commentsWithPostId = comments.map(comment => ({
          ...comment,
          postId: createdPost.id
        }))
        await this.createManyComments(commentsWithPostId)
      }
    }
  }

  // Delete operations
  async deleteProfileByClientId(clientId: string): Promise<void> {
    await prisma.instagramProfile.deleteMany({
      where: { clientId }
    })
  }
}

// Export singleton instance
export const instagramRepository = new InstagramRepository()