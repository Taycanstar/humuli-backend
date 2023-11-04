"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRoute_1 = __importDefault(require("./src/routes/userRoute"));
const taskRoute_1 = __importDefault(require("./src/routes/taskRoute"));
const payRoute_1 = __importDefault(require("./src/routes/payRoute"));
const apiRoute_1 = __importDefault(require("./src/routes/apiRoute"));
const path = require("path");
const authRoute_1 = __importDefault(require("./src/routes/authRoute"));
const User_1 = __importDefault(require("./src/models/User"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 8000;
const server = http_1.default.createServer(app);
const wss = new ws_1.Server({ server });
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const uri = process.env.DB_URI;
const d = process.env.POSTMARK_API_TOKEN;
//init routes
app.use("/u", userRoute_1.default);
app.use("/api", apiRoute_1.default);
app.post("/auth", authRoute_1.default);
app.use("/task", taskRoute_1.default);
app.use("/pay", payRoute_1.default);
// Route to serve the success page
app.get("/success", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "success.html"));
});
// Connect to MongoDB
mongoose_1.default
    .connect(uri)
    .then(() => {
    console.log("Connected to MongoDB");
})
    .catch((error) => {
    console.error("Error connecting to MongoDB", error);
});
app.get("/", (req, res) => {
    res.send("Hello, world!");
});
// Store connections
const connections = {};
wss.on("connection", (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get("userId");
    if (userId) {
        // connections[userId] = ws;
        console.log(`User ${userId} connected`);
        const ws = connections[userId];
        if (ws && ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
                event: "subscription_updated",
                subscription: "plus",
            }));
            console.log(`Notification sent to user ${userId}`);
        }
        else {
            console.log(`User ${userId} is not connected or socket is not open`);
        }
        ws.on("close", () => {
            delete connections[userId];
            console.log(`User ${userId} disconnected`);
        });
    }
    else {
        ws.close();
        console.log("Connection closed due to missing userId");
    }
});
// This is a server-side pseudo-code example
// This would be set up in your server code
app.post("/catwebhook", express_1.default.json({ type: "application/json" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const event = req.body;
    // You can verify the data is from RevenueCat if necessary, by checking a shared secret or signature
    try {
        // Handle the different types of events
        if (event.event_type === "INITIAL_PURCHASE") {
            // A user has started a new subscription
            const userId = event.subscriber.attributes.subscriber_user_id; // Retrieve this based on how you've set up your identifiers
            const userSubscriptionStatus = "plus"; // This is an example, set the appropriate status based on the event details
            // Update the user's subscription status in your database
            const user = yield User_1.default.findByIdAndUpdate(userId, { subscription: userSubscriptionStatus }, { new: true });
            // Additional handling, such as notifying the user (if necessary)
            // Respond to RevenueCat to acknowledge receipt of the webhook
            res.status(200).send("Received");
        }
        else if (event.event_type === "RENEWAL") {
            // A user's subscription has renewed
            // Similar handling as above
        }
        else if (event.event_type === "CANCELLATION") {
            const userId = event.subscriber.attributes.subscriber_user_id;
            // A user has cancelled their subscription
            const user = yield User_1.default.findByIdAndUpdate(userId, { subscription: "standard" }, { new: true });
            // Similar handling as above, possibly setting the userSubscriptionStatus to 'standard' or similar
        }
    }
    catch (error) {
        console.error("Error handling RevenueCat webhook:", error);
        res.status(500).send("Internal Server Error");
    }
}));
app.post("/webhook", express_1.default.json({ type: "application/json" }), (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const event = request.body;
    try {
        // Handle the event
        switch (event.type) {
            case "checkout.session.completed":
                const checkoutSession = event.data.object;
                if (checkoutSession.mode === "subscription") {
                    const userId = checkoutSession.metadata.userId;
                    if (!userId) {
                        console.error("User ID is missing in metadata");
                        return response
                            .status(400)
                            .send("Metadata is missing the user ID");
                    }
                    const user = yield User_1.default.findByIdAndUpdate(userId, { subscription: "plus" }, { new: true });
                    if (!user) {
                        console.error(`User not found for ID: ${userId}`);
                        return response
                            .status(404)
                            .send(`User not found for ID: ${userId}`);
                    }
                    console.log(`User subscription updated to 'plus' for user ID: ${userId}`);
                    // Notify frontend
                    const ws = connections[userId];
                    if (ws && ws.readyState === ws.OPEN) {
                        ws.send(JSON.stringify({
                            event: "subscription_updated",
                            subscription: "plus",
                        }));
                        console.log(`Notification sent to user ${userId}`);
                    }
                    else {
                        console.log(`User ${userId} is not connected or socket is not open`);
                    }
                }
                break;
            // Handle other event types as needed
            case "invoice.payment_failed":
                const invoice = event.data.object;
                const userId = invoice.metadata.userId;
                if (!userId) {
                    console.error("User ID is missing in metadata");
                    return response.status(400).send("Metadata is missing the user ID");
                }
                const user = yield User_1.default.findByIdAndUpdate(userId, { subscription: "standard" }, { new: true });
                if (!user) {
                    console.error(`User not found for ID: ${userId}`);
                    return response
                        .status(404)
                        .send(`User not found for ID: ${userId}`);
                }
                console.log(`User subscription updated to 'standard' for user ID: ${userId}`);
                // Notify frontend (if needed)
                const ws = connections[userId];
                if (ws && ws.readyState === ws.OPEN) {
                    ws.send(JSON.stringify({
                        event: "subscription_updated",
                        subscription: "standard",
                    }));
                    console.log(`Notification sent to user ${userId}`);
                }
                else {
                    console.log(`User ${userId} is not connected or socket is not open`);
                }
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        // Return a response to acknowledge receipt of the event
        response.json({ received: true });
    }
    catch (error) {
        console.error("Error in webhook handler:", error);
        response.status(500).send("Internal Server Error");
    }
}));
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
