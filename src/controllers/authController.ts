import passport from "passport";
import oauth2orize from "oauth2orize";
import User from "../models/User";
import Token from "../models/Token";
import Code from "../models/Code";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Client, { IClient } from "../models/Client";

const server = oauth2orize.createServer();

server.serializeClient(function (client: any, done: any) {
  done(null, client._id);
});

server.deserializeClient(function (id: any, done: any) {
  Client.findById(id, function (err: any, client: IClient | null) {
    if (err) {
      return done(err);
    }
    return done(null, client);
  });
});

server.grant(
  oauth2orize.grant.code(function (
    client: IClient,
    redirectUri: string,
    user: any,
    ares: any,
    done: any
  ) {
    const code = crypto.randomBytes(32).toString("hex");
    const ac = new Code({
      value: code,
      clientId: client.id,
      redirectUri: redirectUri,
      userId: user._id,
    });
    ac.save()
      .then((code: any) => {
        done(null, code);
      })
      .catch((err: any) => {
        done(err);
      });
  })
);

server.exchange(
  oauth2orize.exchange.code(function (
    client: IClient,
    code: any,
    redirectUri: any,
    done: any
  ) {
    Code.findOne({ value: code }, function (err: any, authCode: any) {
      if (err) {
        return done(err);
      }
      if (!authCode) {
        return done(null, false);
      }
      if (client.id.toString() !== authCode.clientId) {
        return done(null, false);
      }
      if (client.redirectUri.toString() !== redirectUri) {
        return done(null, false);
      }

      authCode.remove(function (err: any) {
        if (err) {
          return done(err);
        }

        const token = jwt.sign(
          { _id: authCode.userId },
          process.env.SECRET as string,
          { expiresIn: "1h" }
        );
        const accessToken = new Token({
          value: token,
          clientId: authCode.clientId,
          userId: authCode.userId,
        });

        accessToken
          .save()
          .then(() => {
            done(null, token);
          })
          .catch((err: any) => {
            done(err);
          });
      });
    });
  })
);

export const authorization = [
  passport.authenticate("local", { session: false }),
  server.authorization(function (clientId: any, redirectUri: any, done: any) {
    Client.findOne(
      { id: clientId },
      function (err: any, client: IClient | null) {
        if (err) {
          return done(err);
        }
        if (!client) {
          return done(null, false);
        }
        if (client.redirectUri.toString() !== redirectUri) {
          return done(null, false);
        }
        return done(null, client, redirectUri);
      }
    );
  }),
  function (req: any, res: any) {
    res.json({
      transactionID: req.oauth2?.transactionID,
      user: req.user,
      client: req.oauth2?.client,
    });
  },
];

export const decision = [
  passport.authenticate("local", { session: false }),
  server.decision(),
];

export const token = [
  passport.authenticate("local", { session: false }),
  server.token(),
  server.errorHandler(),
];
