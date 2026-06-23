import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const getFeed = async (req, res) => {
    try {
        const userId = req.userId;
        const posts = await prisma.communityPost.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                hugRecords: {
                    where: { userId }
                }
            }
        });
        // Map posts to include a boolean hasHugged
        const feed = posts.map((post) => ({
            id: post.id,
            content: post.content,
            group: post.group,
            hugs: post.hugs,
            isAnonymous: post.isAnonymous,
            createdAt: post.createdAt,
            hasHugged: post.hugRecords.length > 0
        }));
        res.json(feed);
    }
    catch (error) {
        console.error('Error fetching community feed:', error);
        res.status(500).json({ message: 'Failed to fetch community feed' });
    }
};
export const createPost = async (req, res) => {
    try {
        const userId = req.userId;
        const { content, group = 'General', isAnonymous = true } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }
        const post = await prisma.communityPost.create({
            data: {
                userId,
                content,
                group,
                isAnonymous
            }
        });
        res.status(201).json(post);
    }
    catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Failed to create post' });
    }
};
export const toggleHug = async (req, res) => {
    try {
        const userId = req.userId;
        const postId = req.params.postId;
        const existingHug = await prisma.communityHug.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });
        if (existingHug) {
            // Remove hug
            await prisma.$transaction([
                prisma.communityHug.delete({ where: { id: existingHug.id } }),
                prisma.communityPost.update({
                    where: { id: postId },
                    data: { hugs: { decrement: 1 } }
                })
            ]);
            res.json({ action: 'unhugged' });
        }
        else {
            // Add hug
            await prisma.$transaction([
                prisma.communityHug.create({
                    data: { userId, postId }
                }),
                prisma.communityPost.update({
                    where: { id: postId },
                    data: { hugs: { increment: 1 } }
                })
            ]);
            res.json({ action: 'hugged' });
        }
    }
    catch (error) {
        console.error('Error toggling hug:', error);
        res.status(500).json({ message: 'Failed to toggle hug' });
    }
};
//# sourceMappingURL=community.controller.js.map