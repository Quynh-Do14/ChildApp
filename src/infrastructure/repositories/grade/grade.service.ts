import { Endpoint } from "../../../core/common/apiLink";
import { RequestService } from "../../utils/response";

class GradeService {
    async getGrade(setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                get(Endpoint.Grade.GetGPA,
                    {}
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
    async getGradeByUser(setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                get(`${Endpoint.Grade.GetGradeByUser}`,
                    {}
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

    async getGradeByCoures(id: string, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                get(`${Endpoint.Grade.GetGradeByCourse}/${id}`,
                    {}
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

export default new GradeService();