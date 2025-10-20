import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: Date;
  };
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private store: RateLimitStore = {};

  constructor(
    @InjectRepository(ApiKey)
    private apiKeysRepository: Repository<ApiKey>,
  ) {
    // Clean up expired entries every hour
    setInterval(() => this.cleanup(), 3600000);
  }

  async use(req: Request, res: Response, next: NextFunction) {
    // Only rate limit public API endpoints
    if (!req.path.startsWith('/public')) {
      return next();
    }

    const apiKey = req.headers['x-api-key'] as string || req.query['api_key'] as string;

    if (!apiKey) {
      return next();
    }

    // Get API Key record
    const keyRecord = await this.apiKeysRepository.findOne({
      where: { key: apiKey },
    });

    if (!keyRecord) {
      return next();
    }

    const limit = keyRecord.rateLimit || 1000;
    const now = new Date();

    // Initialize or get existing rate limit data
    if (!this.store[apiKey] || this.store[apiKey].resetAt < now) {
      this.store[apiKey] = {
        count: 0,
        resetAt: new Date(now.getTime() + 3600000), // 1 hour from now
      };
    }

    // Increment counter
    this.store[apiKey].count++;

    // Check if limit exceeded
    if (this.store[apiKey].count > limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Rate limit exceeded. Try again later.',
          limit,
          resetAt: this.store[apiKey].resetAt,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', (limit - this.store[apiKey].count).toString());
    res.setHeader('X-RateLimit-Reset', this.store[apiKey].resetAt.toISOString());

    next();
  }

  private cleanup() {
    const now = new Date();
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].resetAt < now) {
        delete this.store[key];
      }
    });
  }
}
