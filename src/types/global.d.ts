interface Window {
  closeAIStorageBridge: {
    get(keys: string | string[] | object): Promise<any>;
    set(data: object): Promise<boolean>;
    _handleResponse(response: any): void;
    _requestCounter: number;
    _pendingRequests: Map<number, Function>;
  }
}

declare chrome: any;