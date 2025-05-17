export class Endpoint {
    static Auth = class {
        static Login = "/auth/login"
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

    static Exam = class {
        static Get = "/v1/exams/search"
    }
    static Schedule = class {
        static Get = "/v1/schedules"
        static GetById = "/v1/schedules/studentId"
    }
    static Enrollment = class {
        static Get = "/v1/enrollment"
        static Create = "/v1/enrollment"
    }
    static CourseClass = class {
        static Get = "/v1/courseClass"
    }
    static Grade = class {
        static GetGPA = "/v1/grades/total"
        static GetGradeByUser = "/v1/grades/userId"
        static GetGradeByCourse = "/v1/grades/courseId"
    }
    static Notification = class {
        static RegisterToken = "/device-tokens/register"
    }
};