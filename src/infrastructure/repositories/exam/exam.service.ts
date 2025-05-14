import { Endpoint } from "../../../core/common/apiLink";
import { RequestService } from "../../utils/response";

class ExamService {
    async getExam(params: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                get(Endpoint.Exam.Get,
                    { ...params }
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

}

export default new ExamService();