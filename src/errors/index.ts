export interface IError {
  message: string;
  isCustomError: boolean;
  name: string;
  code: string;
  statusCode: number;
}

export class BaseError extends Error implements IError {
  message: string = '';
  isCustomError: boolean = true;
  name: string = '';
  code: string;
  statusCode: number;
  constructor(message: string, code: string) {
    super(message);
    this.message = message;
    this.code = code;
  }
}

// Client Error 4xx
// The 4xx class of status code is intended for cases in which the client seems to have erred. Except when responding to a HEAD request, the server SHOULD include an entity containing an explanation of the error situation, and whether it is a temporary or permanent condition. These status codes are applicable to any request method. User agents SHOULD display any included entity to the user.
// If the client is sending data, a server implementation using TCP SHOULD be careful to ensure that the client acknowledges receipt of the packet(s) containing the response, before the server closes the input connection. If the client continues sending data to the server after the close, the server's TCP stack will send a reset packet to the client, which may erase the client's unacknowledged input buffers before they can be read and interpreted by the HTTP application.

export class BadRequest extends BaseError {
  constructor(message: string, code: string = 'BADREQUEST') {
    super(message, code);
    this.statusCode = 400;
  }
}

export class Unauthorized extends BaseError {
  constructor(message: string, code: string = 'UNAUTHORIZED') {
    super(message, code);
    this.statusCode = 401;
  }
}

export class Forbidden extends BaseError {
  constructor(message: string, code: string = 'FORBIDDEN') {
    super(message, code);
    this.statusCode = 403;
  }
}

export class NotFound extends BaseError {
  constructor(message: string, code: string = 'NOT_FOUND') {
    super(message, code);
    this.statusCode = 404;
  }
}

export class MethodNotAllowed extends BaseError {
  constructor(message: string, code: string = 'METHOD_NOT_ALLOWED') {
    super(message, code);
    this.statusCode = 405;
  }
}

export class NotAcceptable extends BaseError {
  constructor(message: string, code: string = 'NOT_ACCEPTABLE') {
    super(message, code);
    this.statusCode = 406;
  }
}

// Server Error 5xx
// Response status codes beginning with the digit "5" indicate cases in which the server is aware that it has erred or is incapable of performing the request. Except when responding to a HEAD request, the server SHOULD include an entity containing an explanation of the error situation, and whether it is a temporary or permanent condition. User agents SHOULD display any included entity to the user. These response codes are applicable to any request method.

export class InternalServerError extends BaseError {
  constructor(message: string, code: string = 'INTERNAL_SERVER_ERROR') {
    super(message, code);
    this.statusCode = 500;
  }
}

export class NotImplemented extends BaseError {
  constructor(message: string, code: string = 'NOT_IMPLEMENTED') {
    super(message, code);
    this.statusCode = 501;
  }
}

export class ServiceUnavailable extends BaseError {
  constructor(message: string, code: string = 'SERVICE_UNAVAILABLE') {
    super(message, code);
    this.statusCode = 503;
  }
}
