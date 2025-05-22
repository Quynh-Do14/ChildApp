import { Endpoint } from "../../../core/common/apiLink";
import { RequestService } from "../../utils/response";

class FolderService {
    async getFolder(setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                get(Endpoint.Folder.Get,
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
    async getFolderbyId(id: string, keyword: string, setLoading: Function) {
        console.log('id', id);

        setLoading(true)
        try {
            return await RequestService.
                get(`${Endpoint.Folder.GetById}/${id}/messages`,
                    {
                        keyword: keyword
                    }
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
    async createFolder(data: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                post(Endpoint.Folder.Create,
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
    async saveFolder(data: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                post(Endpoint.Folder.Save,
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
    async updateFolder(id: string, data: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                put(`${Endpoint.Folder.Update}/${id}`,
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
    async deleteFolder(id: string, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                delete(`${Endpoint.Folder.Delete}/${id}`,
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

export default new FolderService();