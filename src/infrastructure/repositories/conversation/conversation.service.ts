import { Endpoint } from "../../../core/common/apiLink";
import { RequestService } from "../../utils/response";

class CourseClassService {
    async getMyConversation(setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                get(Endpoint.Conversation.MyConversation,
                ).then(response => {
                    return response;
                });
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    }
    async SendMessage(data: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                postForm(Endpoint.Conversation.SendMessage,
                    data,
                ).then(response => {
                    return response;
                });
        }
        catch (error) {
            console.error(error)
        } finally {
            setLoading(false);
        }
    }
    async GetChatLogById(id: String, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                get(`${Endpoint.Conversation.ChatLog}/${id}`).then(response => {
                    return response;
                });
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    }
}

export default new CourseClassService();