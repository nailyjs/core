import { __decorate, __metadata } from 'tslib';
import { Autowired, Bean } from '@nailyjs/core/common';
import { TestService } from './test.service';

let T = class T {
    constructor() {
        console.log(this.testService);
    }
};
__decorate([
    Autowired(),
    __metadata("design:type", TestService)
], T.prototype, "testService", void 0);
T = __decorate([
    Bean(),
    __metadata("design:paramtypes", [])
], T);

export { T };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXV0b3dpcmVkLCBCZWFuIH0gZnJvbSBcIkBuYWlseWpzL2NvcmUvY29tbW9uXCI7XG5pbXBvcnQgeyBUZXN0U2VydmljZSB9IGZyb20gXCIuL3Rlc3Quc2VydmljZVwiO1xuXG5AQmVhbigpXG5leHBvcnQgY2xhc3MgVCB7XG4gIEBBdXRvd2lyZWQoKVxuICBwcml2YXRlIHJlYWRvbmx5IHRlc3RTZXJ2aWNlOiBUZXN0U2VydmljZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLnRlc3RTZXJ2aWNlKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFJYSxJQUFBLENBQUMsR0FBUCxNQUFNLENBQUMsQ0FBQTtBQUlaLElBQUEsV0FBQSxHQUFBO0FBQ0UsUUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUMvQjtFQUNGO0FBTGtCLFVBQUEsQ0FBQTtBQURoQixJQUFBLFNBQVMsRUFBRTs4QkFDa0IsV0FBVyxDQUFBO0FBQUMsQ0FBQSxFQUFBLENBQUEsQ0FBQSxTQUFBLEVBQUEsYUFBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7QUFGL0IsQ0FBQyxHQUFBLFVBQUEsQ0FBQTtBQURiLElBQUEsSUFBSSxFQUFFOztBQUNNLENBQUEsRUFBQSxDQUFDLENBT2I7Ozs7In0=
