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
- VerifyStatus（PENDING 待审 / APPROVED 通过 / REJECTED 驳回 / CLOSED 关闭）:
  - 前端：`constants/VerifyStatus.ts`、`types/VerifyStatus.ts`、`constants/statusText.ts`、`utils/formatters.ts`、`utils/barrierReview.ts`、`mocks/localDb.ts`、`pages/ReportsPage.tsx` 筛选器与按钮显隐。
  - 后端：`constants/VerifyStatus.ts`、`models/BarrierReport.ts`、`utils/barrierReview.ts`、`services/BarrierReportService.ts`、`controllers/BarrierReportController.ts`、`routes/BarrierReportRoutes.ts`、`seed.ts`。
- RiskLevel（LOW / MEDIUM / HIGH）: `constants/RiskLevel.ts`、`utils/formatters.ts`、`hooks/useRouteRisk.ts`、`pages/RoutesPage.tsx`，后端 `constants/RiskLevel.ts`、`utils/barrierReview.ts`、`seed.ts`。

## 障碍工单审核流程

工单在 `/reports` 页处理，接口为 `POST /api/barrier-report/:id/review`，动作 `approve | reject | close`：

- **通过（approve）**：仅“待审”可通过。对应设施被停用（`BLOCKED`，通过时锁定 `base_status` 基线），包含该设施的路线风险升到“高”（锁定 `base_risk_level` 基线）。
- **驳回（reject）**：仅“待审”可驳回，不改动任何设施与路线。
- **关闭（close）**：待审直接关闭不产生影响；已通过工单关闭时只回退这张工单造成的影响——同设施仍有其他“通过未关闭”工单时保持停用/高风险，否则恢复各自基线。设施当前若被巡检标记为“维修中”，回退时保持维修不变（巡检入口在 `/facilities` 页）。
- **重复处理**：已处于通过/驳回/关闭的工单再次提交时返回 `409 REPORT_ALREADY_PROCESSED`，响应体带回当前状态与处理人，设施和路线不再变化；页面显示当前状态与处理人并禁用处理按钮。
- 设施与路线的联动结果由后端在审核响应中一并返回并写入对应 Zustand store，切回 `/routes` 或 `/facilities` 页仍可看到新的风险等级、受影响设施与停用原因；后端不可达时前端走 `mocks/localDb.ts` 内置的同一套审核引擎并用 localStorage 持久化。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
