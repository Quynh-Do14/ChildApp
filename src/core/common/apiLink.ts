export class Endpoint {
    static Auth = class {
        static Login = "/auth/login"
        static OTP = "/auth/child/login"
        static Signup = "/auth/signup"
        static Profile = "/users/profile"
        static UpdateProfile = "/students/me"
        static ResetPassword = "/auth/reset-password"
        static ForgotPassword = "/api/auth/forgot-password"
    }

    static Conversation = class {
        static MyConversation = "/conversations/my-conversations"
        static SendMessage = "/conversations/send-message"
        static ChatLog = "/conversations/chatlogs"
    }
    static User = class {
        static MyChild = "/users/my-children"
        static GetChildById = "/api/children"
        static MyParent = "/users/my-parent"
        static Create = "/api/children"
        static Update = "/api/children"
        static Delete = "/api/children"
    }
    static Mission = class {
        static Get = "/missions/my-missions"
        static GetById = "/missions/get"
        static Create = "/missions/parent/create"
        static Update = "/missions/parent/update"
        static Complete = "/missions/child/complete"
        static Confirm = "/missions/parent/confirm"
        static Delete = "/missions/parent/delete"
    }
    static Inspector = class {
        static Get = "/api/guardians"
        static GetById = "/api/guardians"
        static Create = "/api/guardians"
        static Update = "/api/guardians"
        static Delete = "/api/guardians"
    }
    static Notification = class {
        static RegisterToken = "/device-tokens/register"
        static UnregisterToken = "/device-tokens/unregister"
        static RegisterTokenEmail = "/device-tokens/register-email"
    }
};