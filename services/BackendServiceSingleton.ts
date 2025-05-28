import { BackendService } from "./BackendService";

class BackendServiceSingleton {
    private static instance: BackendService;

    static getInstance() {
        if (!BackendServiceSingleton.instance) {
            BackendServiceSingleton.instance = new BackendService();
        }
        return BackendServiceSingleton.instance;
    }
}

export default BackendServiceSingleton;