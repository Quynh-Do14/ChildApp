import moment from "moment";
import Constants from "../../core/common/constants";
const baseURL = "http://192.168.100.79:8080/api";
export const validateFields = (isImplicitChange: boolean, key: any, isCheck: boolean, setError: Function, error: any, message: string) => {
    if (isImplicitChange) {
        error[key] = {
            isError: isCheck,
            message: message,
        };
    }
    else {
        setError({
            ...error,
            [key]: {
                isError: isCheck,
                message: message,
            }
        });
    }
};

export const numberToAlphabet = (number: number) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const alphabetSplit = alphabet.split("");
    if (number < alphabetSplit.length) {
        const result = alphabetSplit[number]
        return result
    }
    return number
}

export const convertDate = (date: any) => {
    if (date) {
        let dateFormat = new Date(date);
        return moment(dateFormat).format("DD-MM-YYYY hh:mm:ss");
    } return null;

};
export const convertDateOnly = (date: any, reverse?: boolean) => {
    if (date) {
        let dateFormat = new Date(date);
        if (reverse) {
            return moment(dateFormat).format("YYYY-MM-DD");
        }
        return moment(dateFormat).format("DD/MM/YYYY");
    } return null;
};

export const convertTimeOnly = (date: string) => {
    if (date) {
        let dateFormat = new Date(date);
        return moment(dateFormat).format("hh:mm");
    } return null;
};

export const convertDateBooking = (date: string) => {
    if (date) {
        let dateFormat = new Date(date);
        return moment(dateFormat).format("YYYY-MM-DDThh:mm:ss");
    } return null;
};

export const convertTimeParams = (date: string) => {
    if (date) {
        const inputDate = new Date(date);
        const year = inputDate.getFullYear();
        const month = inputDate.getMonth() + 1; // Tháng trong JavaScript đếm từ 0 đến 11
        const day = inputDate.getDate();
        const hours = inputDate.getHours();
        const minutes = inputDate.getMinutes();
        const seconds = inputDate.getSeconds();

        // Chuyển đổi các giá trị thành chuỗi và thêm số 0 đằng trước nếu cần thiết
        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        return formattedDate
    } return null;
};

export const reverseConvertDate = (inputDateString: string) => {
    const inputDate = new Date(inputDateString);

    // Format the date as "Thu, 26 Oct 2023 13:05:32 GMT"
    const formattedDate = inputDate.toUTCString();
    return formattedDate
}

// export const showImage = (img) => {
//     if (img) {
//         return img
//     }
//     else {
//         return noImgShow
//     }
// }

export const convertMinutes = (minutes: any) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(remainingMinutes).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;
}

export const convertMiliSecond = (miliSecond: any) => {
    const minutes = Math.floor(miliSecond / 1000 / 60);
    const remainingSeconds = (miliSecond / 1000 % 60).toFixed(0);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(remainingMinutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export const getCurrentDateTimeISO = (originalDate: any) => {
    const year = originalDate.getUTCFullYear();
    const month = String(originalDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(originalDate.getUTCDate()).padStart(2, '0');
    const hours = String(originalDate.getUTCHours()).padStart(2, '0');
    const minutes = String(originalDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(originalDate.getUTCSeconds()).padStart(2, '0');

    const formattedDateString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000+00:00`;
    return formattedDateString
}

export function convertUtcToVietnamTime(utcInput: any) {
    let date;

    // Parse đầu vào thành đối tượng Date
    if (typeof utcInput === 'string' || typeof utcInput === 'number') {
        date = new Date(utcInput);
    } else if (utcInput instanceof Date) {
        date = utcInput;
    } else {
        throw new Error('Giá trị đầu vào không hợp lệ. Phải là Date, chuỗi, hoặc số.');
    }
    // Cộng thêm 7 giờ (7 * 60 * 60 * 1000 ms)
    const vietnamDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return vietnamDate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
}

export const timeToMilliseconds = (timeString: string) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const milliseconds = ((hours * 3600) + (minutes * 60) + seconds) * 1000;
    return milliseconds;
}
export const minuteToMiliSecond = (minutes: number) => {
    const result = minutes * 60 * 1000;
    return result;
}

export const keepLastObjectsWithUniqueIds = (array: Array<any>) => {
    const idSet = [];
    const result = [];

    for (let i = array.length - 1; i >= 0; i--) {
        const obj = array[i];
        if (!idSet[obj.questionId]) {
            result.unshift(obj);
            idSet[obj.questionId] = true;
        }
    }
    return result;
}

export const genderConfig = (gender: string) => {
    if (gender == Constants.Gender.MALE.value) {
        return Constants.Gender.MALE.label;
    }
    else if (gender == Constants.Gender.FEMALE.value) {
        return Constants.Gender.FEMALE.label
    }
}

export const formatCurrencyVND = (amount: string) => {
    let formattedAmount = amount.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedAmount} ₫`;
}

export const configImageURL = (image: string) => {
    if (image) {
        return `${baseURL}/images/uploads/avatars/${image}`;
    }
    return ""
}
export const configImageURLIncludeHTTP = (image: string) => {
    if (image.includes("http")) {
        return image;
    }
    if (image) {
        return `${baseURL}/uploads/${image}`;
    }
    return ""
}

export function getStartAndEndOfWeek(date = new Date()) {
    // Clone ngày truyền vào để không thay đổi gốc
    const currentDate = new Date(date);

    // Lấy ngày trong tuần (0: Chủ Nhật, 1: Thứ Hai, ..., 6: Thứ Bảy)
    const day = currentDate.getDay();

    // Tính toán offset để tìm Thứ Hai (đầu tuần)
    const diffToMonday = (day === 0 ? -6 : 1) - day;

    // Tạo ngày đầu tuần (Thứ Hai)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() + diffToMonday);

    // Tạo ngày cuối tuần (Chủ Nhật)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return {
        startOfWeek,
        endOfWeek
    };
}
export function getVietnameseDayOfWeek(dayNumber: number): string {
    const days = [
        "Thứ hai",
        "Thứ ba",
        "Thứ tư",
        "Thứ năm",
        "Thứ sáu",
        "Thứ bảy",
        "Chủ nhật",
    ];
    const result = String(days[dayNumber - 1])
    return result || "Không hợp lệ";
}
export function translateDayToVietnamese(day: string) {
    const days = {
        MONDAY: "Thứ hai",
        TUESDAY: "Thứ ba",
        WEDNESDAY: "Thứ tư",
        THURSDAY: "Thứ năm",
        FRIDAY: "Thứ sáu",
        SATURDAY: "Thứ bảy",
        SUNDAY: "Chủ nhật"
    };
    const result = days[day.toUpperCase()]
    return result || "Không hợp lệ";
}