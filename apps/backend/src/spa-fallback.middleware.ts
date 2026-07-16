import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { join } from 'path';

@Injectable()
export class SpaFallbackMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const accept = req.headers.accept || '';
    
    // Skip static uploads directory to allow direct file downloads
    if (req.path.startsWith('/uploads') || req.baseUrl.startsWith('/uploads')) {
      return next();
    }
    
    // If browser is requesting text/html, serve the React index.html
    if (accept.includes('text/html') && req.method === 'GET') {
      return res.sendFile(join(process.cwd(), 'client', 'index.html'));
    }
    next();
  }
}
