import { Alert } from "react-native";
import { Endpoint } from "../../../core/common/apiLink";
import { RequestService } from "../../utils/response";
import { messageConfig } from "../../helper/message";

class EnrollmentService {
    async getEnrollment(params: any, setLoading: Function) {
        setLoading(true)
        try {
            return await RequestService.
                get(Endpoint.Enrollment.Get,
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
    async createEnrollment(data: any, setLoading: Function) {
        setLoading(true);
        console.log("Endpoint.Enrollment.Create", Endpoint.Enrollment.Create);
        console.log("data", data);
        try {
            return await RequestService.
                post(Endpoint.Enrollment.Create,
                    data
                ).then(response => {
                    Alert.alert(`Đăng kí thành công`);
                    return response;
                });
        } catch (error: any) {
            Alert.alert(`Đăng kí không thành công`, error.response.data.message);
            console.error(error)
        } finally {
            setLoading(false);
        }
    }
}

export default new EnrollmentService();