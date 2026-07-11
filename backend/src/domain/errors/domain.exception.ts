export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestException extends DomainException {
  constructor(message = 'Bad Request') {
    super(message);
  }
}

export class UnauthorizedException extends DomainException {
  constructor(message = 'Unauthorized') {
    super(message);
  }
}

export class ForbiddenException extends DomainException {
  constructor(message = 'Forbidden') {
    super(message);
  }
}

export class NotFoundException extends DomainException {
  constructor(message = 'Not Found') {
    super(message);
  }
}

export class ConflictException extends DomainException {
  constructor(message = 'Conflict') {
    super(message);
  }
}
