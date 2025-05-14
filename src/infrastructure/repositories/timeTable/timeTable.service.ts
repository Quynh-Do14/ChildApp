import { Endpoint } from "../../../core/common/apiLink";
import { RequestService } from "../../utils/response";

class TimeTableService {
    async getTimeTable(params: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                get(Endpoint.Schedule.GetById,
                    params
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

export default new TimeTableService();