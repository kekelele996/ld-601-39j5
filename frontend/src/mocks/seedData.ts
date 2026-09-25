export const mockData = {
  "userProfile": [
    {
      "id": 1,
      "nickname": "林晓",
      "phone": "13800000001",
      "mobility_type": "LOW_VISION",
      "assistive_device": "盲杖",
      "emergency_contact": "林岚 13900000001",
      "preferred_language": "zh-CN",
      "created_at": "2026-09-10T09:00:00Z"
    },
    {
      "id": 2,
      "nickname": "周岩",
      "phone": "13800000002",
      "mobility_type": "WHEELCHAIR",
      "assistive_device": "手动轮椅",
      "emergency_contact": "周敏 13900000002",
      "preferred_language": "zh-CN",
      "created_at": "2026-09-12T09:00:00Z"
    },
    {
      "id": 3,
      "nickname": "吴奶奶",
      "phone": "13800000003",
      "mobility_type": "ELDERLY",
      "assistive_device": "助行器",
      "emergency_contact": "吴昊 13900000003",
      "preferred_language": "zh-CN",
      "created_at": "2026-09-13T09:00:00Z"
    }
  ],
  "accessibleFacility": [
    {
      "id": 1,
      "facility_type": "RAMP",
      "name": "东门无障碍坡道",
      "location_code": "GATE-E-RAMP-01",
      "floor": "1F",
      "status": "AVAILABLE",
      "last_checked_at": "2026-09-20T09:00:00Z",
      "owner_department": "物业一部",
      "note": "连接东门广场与一层大厅"
    },
    {
      "id": 2,
      "facility_type": "ELEVATOR",
      "name": "中庭无障碍电梯",
      "location_code": "CORE-LIFT-02",
      "floor": "1F-3F",
      "status": "MAINTENANCE",
      "last_checked_at": "2026-09-21T14:00:00Z",
      "owner_department": "设备科",
      "note": "巡检发现按钮面板松动，已标记维修"
    },
    {
      "id": 3,
      "facility_type": "TACTILE_PAVING",
      "name": "北门盲道",
      "location_code": "GATE-N-TACTILE-03",
      "floor": "1F",
      "status": "AVAILABLE",
      "last_checked_at": "2026-09-19T10:30:00Z",
      "owner_department": "市政管养",
      "note": "与公交站盲道衔接"
    },
    {
      "id": 4,
      "facility_type": "TOILET",
      "name": "三层无障碍卫生间",
      "location_code": "L3-WC-ACCESSIBLE-04",
      "floor": "3F",
      "status": "AVAILABLE",
      "last_checked_at": "2026-09-18T11:00:00Z",
      "owner_department": "保洁中心",
      "note": "扶手与呼叫铃正常"
    }
  ],
  "routePlan": [
    {
      "id": 1,
      "user_id": 1,
      "origin_text": "东门广场",
      "destination_text": "三层服务台",
      "route_mode": "WHEELCHAIR",
      "risk_level": "LOW",
      "estimated_minutes": 12,
      "facility_ids": [1, 2, 4],
      "created_at": "2026-09-15T09:00:00Z"
    },
    {
      "id": 2,
      "user_id": 2,
      "origin_text": "北门公交站",
      "destination_text": "一层大厅",
      "route_mode": "WHEELCHAIR",
      "risk_level": "MEDIUM",
      "estimated_minutes": 8,
      "facility_ids": [3, 1],
      "created_at": "2026-09-16T09:00:00Z"
    },
    {
      "id": 3,
      "user_id": 3,
      "origin_text": "地下车库",
      "destination_text": "三层候诊区",
      "route_mode": "ELDERLY",
      "risk_level": "MEDIUM",
      "estimated_minutes": 15,
      "facility_ids": [2, 4],
      "created_at": "2026-09-17T09:00:00Z"
    }
  ],
  "assistanceRequest": [
    {
      "id": 1,
      "user_id": 1,
      "route_plan_id": 1,
      "helper_id": 1,
      "request_time": "2026-09-20T09:00:00Z",
      "status": "REQUESTED",
      "meet_point": "东门入口",
      "contact_note": "请提前电话联系"
    },
    {
      "id": 2,
      "user_id": 2,
      "route_plan_id": 2,
      "helper_id": 2,
      "request_time": "2026-09-21T09:00:00Z",
      "status": "COMPLETED",
      "meet_point": "北门公交站",
      "contact_note": "随行有导盲犬"
    },
    {
      "id": 3,
      "user_id": 3,
      "route_plan_id": 3,
      "helper_id": 3,
      "request_time": "2026-09-22T09:00:00Z",
      "status": "CANCELLED",
      "meet_point": "车库B2电梯厅",
      "contact_note": "行动较慢，请预留时间"
    }
  ],
  "barrierReport": [
    {
      "id": 1,
      "reporter_id": 1,
      "facility_id": 1,
      "barrier_type": "坡道堵塞",
      "description": "东门坡道被外卖电动车占用，轮椅无法上行",
      "photo_url": "/mock/photo_url-1.png",
      "verify_status": "PENDING",
      "priority": "HIGH"
    },
    {
      "id": 2,
      "reporter_id": 2,
      "facility_id": 3,
      "barrier_type": "盲道破损",
      "description": "北门盲道中段有两处地砖翘起，盲杖探不到连续引导",
      "photo_url": "/mock/photo_url-2.png",
      "verify_status": "PENDING",
      "priority": "MEDIUM"
    },
    {
      "id": 3,
      "reporter_id": 3,
      "facility_id": 4,
      "barrier_type": "误报复核",
      "description": "反馈卫生间门关不上，现场核查为使用后未复位",
      "photo_url": "/mock/photo_url-3.png",
      "verify_status": "REJECTED",
      "priority": "LOW",
      "reviewer": "审核员-赵审",
      "reviewed_at": "2026-09-22T16:00:00Z",
      "review_note": "现场复核设施正常，驳回处理"
    }
  ]
} as const;
