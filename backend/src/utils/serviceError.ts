import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export type ErrorCode = keyof typeof ERROR_CODES;

/** Service 层统一抛出的业务异常，由 controller 再包一层。 */
export class ServiceError extends Error {
  status: number;
  code: ErrorCode;

  constructor(code: ErrorCode, status = 400, detail?: string) {
    super(detail ?? ERROR_MESSAGES[code]);
    this.name = "ServiceError";
    this.status = status;
    this.code = code;
  }
}
