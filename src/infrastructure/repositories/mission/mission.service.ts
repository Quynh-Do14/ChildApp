import { Alert } from "react-native";
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
        console.log("data", data);

        try {
            return await RequestService.
                post(Endpoint.Mission.Create,
                    data
                ).then(response => {
                    return response;
                });
        }
        catch (error: any) {
            console.log(error)
            Alert.alert(`Thêm mới không thành công`, error.response.data.message);
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
        catch (error: any) {
            console.log(error)
            Alert.alert(`Cập nhật không thành công`, error.response.data.message);
        } finally {
            setLoading(false);
        }
    }
    async CompleteMission(id: string, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                put(`${Endpoint.Mission.Complete}/${id}`,
                    {}
                ).then(response => {
                    return response;
                });
        }
        catch (error: any) {
            console.log(error)
            Alert.alert(`Xác nhận không thành công`, error.response.data.message);
        } finally {
            setLoading(false);
        }
    }
    async ConfirmMission(id: string, confirm: boolean, setLoading: Function) {
        console.log("id", id);
        console.log("confirm", confirm);

        setLoading(true)
        try {
            return await RequestService.
                put(`${Endpoint.Mission.Confirm}/${id}?confirm=${confirm}`,
                    {}
                ).then(response => {
                    return response;
                });
        }
        catch (error: any) {
            console.log(error)
            Alert.alert(`Xác nhận không thành công`, error.response.data.message);
        } finally {
            setLoading(false);
        }
    }
    async deleteMission(id: string, setLoading: Function) {
        console.log("id", id);
        setLoading(true)
        try {
            return await RequestService.
                delete(`${Endpoint.Mission.Delete}/${id}`,
                ).then(response => {
                    return response;
                });
        }
        catch (error: any) {
            console.log(error)
            Alert.alert(`Xóa không thành công`, error.response.data.message);
        } finally {
            setLoading(false);
        }
    }
}

export default new MissionService();