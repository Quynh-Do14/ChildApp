import { Endpoint } from "../../../core/common/apiLink";
import { RequestService } from "../../utils/response";

class ScheduleService {
    async getSchedule(params: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                get(Endpoint.Schedule.Get,
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

export default new ScheduleService();