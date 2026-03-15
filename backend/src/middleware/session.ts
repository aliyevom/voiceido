import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";

const HEADER = "x-session-id";

export function sessionId(req: Request, _res: Response, next: NextFunction): void {
  const id = (req.headers[HEADER] as string)?.trim() || uuid();
  (req as Request & { sessionId: string }).sessionId = id;
  next();
}

export function getSessionId(req: Request): string {
  return (req as Request & { sessionId?: string }).sessionId ?? "anonymous";
}
