import { Endpoint } from "../../../core/common/apiLink";
import { RequestService } from "../../utils/response";

class BlockService {
    async getAll(params: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                get(Endpoint.BlockWeb.Get,
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
    async getByChild(setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                get(Endpoint.BlockWeb.GetByChild,
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
    async createWeb(data: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                post(Endpoint.BlockWeb.Create,
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
    // async updateWeb(id: string, data: any, setLoading: Function) {
    //     setLoading(true)
    //     try {
    //         return await RequestService.
    //             put(`${Endpoint.Web.Update}/${id}`,
    //                 data
    //             ).then(response => {
    //                 return response;
    //             });
    //     }
    //     catch (error) {
    //         console.log(error)
    //     } finally {
    //         setLoading(false);
    //     }
    // }
    async deleteWeb(id: string, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                delete(`${Endpoint.BlockWeb.Delete}/${id}`,
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

export default new BlockService();