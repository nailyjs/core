var tslib = require('tslib');
var common = require('@nailyjs/core/common');
var test_service = require('./test.service');

exports.T = class T {
    constructor() {
        console.log(this.testService);
    }
};
tslib.__decorate([
    common.Autowired(),
    tslib.__metadata("design:type", test_service.TestService)
], exports.T.prototype, "testService", void 0);
exports.T = tslib.__decorate([
    common.Bean(),
    tslib.__metadata("design:paramtypes", [])
], exports.T);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXV0b3dpcmVkLCBCZWFuIH0gZnJvbSBcIkBuYWlseWpzL2NvcmUvY29tbW9uXCI7XG5pbXBvcnQgeyBUZXN0U2VydmljZSB9IGZyb20gXCIuL3Rlc3Quc2VydmljZVwiO1xuXG5AQmVhbigpXG5leHBvcnQgY2xhc3MgVCB7XG4gIEBBdXRvd2lyZWQoKVxuICBwcml2YXRlIHJlYWRvbmx5IHRlc3RTZXJ2aWNlOiBUZXN0U2VydmljZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLnRlc3RTZXJ2aWNlKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbIlQiLCJfX2RlY29yYXRlIiwiQXV0b3dpcmVkIiwiVGVzdFNlcnZpY2UiLCJCZWFuIl0sIm1hcHBpbmdzIjoiOzs7O0FBSWFBLFNBQUMsR0FBUCxNQUFNLENBQUMsQ0FBQTtBQUlaLElBQUEsV0FBQSxHQUFBO0FBQ0UsUUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUMvQjtFQUNGO0FBTGtCQyxnQkFBQSxDQUFBO0FBRGhCLElBQUFDLGdCQUFTLEVBQUU7b0NBQ2tCQyx3QkFBVyxDQUFBO0FBQUMsQ0FBQSxFQUFBSCxTQUFBLENBQUEsU0FBQSxFQUFBLGFBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO0FBRi9CQSxTQUFDLEdBQUFDLGdCQUFBLENBQUE7QUFEYixJQUFBRyxXQUFJLEVBQUU7O0FBQ00sQ0FBQSxFQUFBSixTQUFDLENBT2I7OyJ9
