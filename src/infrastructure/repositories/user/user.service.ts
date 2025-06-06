import { Endpoint } from "../../../core/common/apiLink";
import { RequestService } from "../../utils/response";

class UserService {
    async getChild(params: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                get(Endpoint.User.MyChild,
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
    async getParent(setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                get(Endpoint.User.MyParent,
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
    async createUser(data: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                postForm(Endpoint.User.Create,
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
    async updateUser(id: string, data: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                putForm(`${Endpoint.User.Update}/${id}`,
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
    async deleteUser(id: string, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                delete(`${Endpoint.User.Delete}/${id}`,
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
    async notificationSOS(setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                post(Endpoint.Notification.SOS,
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

    async getLocation(setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                get(Endpoint.Notification.GetLocation).then(response => {
                    return response;
                });
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    }

    async shareLocation(data: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                post(Endpoint.Notification.Location,
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
    async sharePin(data: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                post(Endpoint.Notification.Pin,
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
}

export default new UserService();