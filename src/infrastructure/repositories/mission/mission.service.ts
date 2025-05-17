import { Endpoint } from "../../../core/common/apiLink";
import { RequestService } from "../../utils/response";

class MissionService {
    async getMission(setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                get(Endpoint.Mission.Get,
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
    async createMission(data: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                post(Endpoint.Mission.Create,
                    data
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
    async updateMission(id: string, data: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                put(`${Endpoint.Mission.Update}/${id}`,
                    data
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
    async deleteMission(id: string, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                delete(`${Endpoint.Mission.Delete}/${id}`,
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

export default new MissionService();