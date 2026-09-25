# 无障碍出行协助平台

面向视障、轮椅和行动不便人群的室内外无障碍路线协助系统，聚合站点、设施、路线、志愿协助与障碍上报流程。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20101>

后端健康检查：<http://localhost:21101/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Ant Design + Zustand |
| 后端 | NestJS + TypeScript + TypeORM |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `accessroute`
- `FRONTEND_PORT`: 前端端口，默认 `20101`
- `BACKEND_PORT`: 后端端口，默认 `21101`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: accessroute`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-accessroute}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- MobilityType: constants/MobilityType、types/MobilityType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- FacilityStatus: constants/FacilityStatus、types/FacilityStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- AssistanceStatus: constants/AssistanceStatus、types/AssistanceStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- VerifyStatus/ReviewAction（障碍工单审核：PENDING/APPROVED/REJECTED/CLOSED）: 前后端 constants/BarrierReportStatus、types/BarrierReport、constructors/BarrierReport*、logTemplates、errorMessages、utils/barrierReportWorkflow（前端离线状态机）、services/BarrierReportService（后端状态机）、ReportsPage 审核按钮与状态展示均有引用。

## 障碍工单审核流程

- 工单初始为 `PENDING`（待审），可执行通过 / 驳回 / 关闭：`POST /api/barrier-report/:id/review`，请求体 `{ "action": "APPROVE|REJECT|CLOSE", "operator": "处理人" }`。
- 通过：对应设施状态置为 `BLOCKED`（停用），包含该设施的路线风险升为 `HIGH`，并在工单的 `applied_effects` 中快照变更前的设施状态与路线风险。
- 驳回 / 关闭：仅回退本工单 `applied_effects` 记录的影响——设施或路线当前值仍等于本工单写入的值时才还原；巡检等其他来源的修改（如设施被标为 `MAINTENANCE`）保持不变。
- 重复处理同一工单：接口返回 `changed: false` 与当前状态、处理人，设施与路线不再变化。
- 设施巡检：`POST /api/accessible-facility/:id/status`，请求体 `{ "status": "AVAILABLE|BLOCKED|MAINTENANCE|UNKNOWN" }`。
- 前端审核结果会同步到 BarrierReport / AccessibleFacility / RoutePlan 三个 store，切回路线页仍能看到最新风险等级与受影响设施；后端不可用时由 `utils/barrierReportWorkflow` 在本地执行同一状态机。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
