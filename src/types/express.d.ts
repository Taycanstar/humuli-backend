// import { User } from "../models/User";

// declare global {
//   namespace Express {
//     interface Request {
//       user?: User;
//     }
//   }
// }

import { IUser } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
