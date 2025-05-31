import { Endpoint } from "../../../core/common/apiLink";
import { RequestService } from "../../utils/response";

class InspectorService {
    async getInspector(params: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                get(Endpoint.Inspector.Get,
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
    async createInspector(data: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                post(Endpoint.Inspector.Create,
                    data
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
    async updateInspector(id: string, data: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                put(`${Endpoint.Inspector.Update}/${id}`,
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
    async deleteInspector(id: string, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                delete(`${Endpoint.Inspector.Delete}/${id}`,
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

export default new InspectorService();