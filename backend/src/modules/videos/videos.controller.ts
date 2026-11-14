import { Response } from 'express';
import { prisma } from '../../db.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export async function getVideos(req: AuthenticatedRequest, res: Response) {
  try {
    const { subjectCode, chapterId, search, videoType, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isPublished: true,
    };

    if (videoType && (videoType === 'SHORT' || videoType === 'FULL')) {
      where.videoType = videoType;
    }

    if (subjectCode) {
      where.subject = {
        code: (subjectCode as string).toUpperCase(),
      };
    }

    if (chapterId) {
      where.chapterId = chapterId as string;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    const [total, videos] = await Promise.all([
      prisma.video.count({ where }),
      prisma.video.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          subject: true,
          chapter: {
            include: {
              notes: {
                take: 1,
                select: { id: true, title: true },
              },
              questions: {
                take: 2,
                select: { id: true, content: true, examYear: true },
              },
            },
          },
          favorites: req.user?.studentProfileId
            ? {
                where: { studentId: req.user.studentProfileId },
              }
            : false,
        },
      }),
    ]);

    const formattedVideos = videos.map((v) => ({
      ...v,
      isFavorited: req.user?.studentProfileId ? v.favorites.length > 0 : false,
    }));

    return sendSuccess(res, formattedVideos, 'Videos retrieved', 200, {
      page: pageNum,
      limit: limitNum,
      total,
    });
  } catch (err: any) {
    return sendError(res, 'Failed to fetch videos', 500, err.message);
  }
}

export async function toggleFavoriteVideo(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.studentProfileId) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { id } = req.params;

    const existing = await prisma.videoFavorite.findUnique({
      where: {
        studentId_videoId: {
          studentId: req.user.studentProfileId,
          videoId: id,
        },
      },
    });

    if (existing) {
      await prisma.videoFavorite.delete({
        where: { id: existing.id },
      });
      return sendSuccess(res, { favorited: false }, 'Video removed from favorites');
    } else {
      await prisma.videoFavorite.create({
        data: {
          studentId: req.user.studentProfileId,
          videoId: id,
        },
      });
      return sendSuccess(res, { favorited: true }, 'Video added to favorites');
    }
  } catch (err: any) {
    return sendError(res, 'Failed to toggle favorite', 500, err.message);
  }
}

export async function recordVideoView(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const video = await prisma.video.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    if (req.user?.studentProfileId) {
      await prisma.userActivity.create({
        data: {
          studentId: req.user.studentProfileId,
          actionType: 'WATCH_VIDEO',
          title: `Watched video: ${video.title}`,
          metadata: JSON.stringify({ videoId: video.id }),
        },
      });
    }

    return sendSuccess(res, { viewsCount: video.viewsCount }, 'View recorded');
  } catch (err: any) {
    return sendError(res, 'Failed to record video view', 500, err.message);
  }
}

