# Item Stats — 简体中文

## blueprint_craftingset_ruins_builder
- 类型: 制作物
- usage:
  - 制作时给予地板蓝图3张

## blueprint_craftingset_ruinsglow_builder
- 类型: 制作物
- usage:
  - 相同模式
  - 发光地板

## eyeturret_item
- 类型: 建筑
- usage:
  - HP 1000
  - 再生 12/秒
  - 攻击 65
  - 射程 15
  - 攻击周期 3秒
  - 无法锤击

## shadow_forge_kit
- 类型: 安装套件
- usage:
  - 安装 → 暗影裁缝台 (暗影制作 Lv2)
  - 锤击 4次

## thulecite
- 类型: 材料
- 堆叠: 20
- usage:
  - 铥矿修复材料 (HP 100 恢复, 工作量 1.5 恢复)
  - 元素食谱 (饱食度 +3) — 但玩家无法食用 (NPC专用: 尘蛾/鼹鼠/蜗牛龟)
  - 鼹鼠诱饵

## wall_ruins_item
- 类型: 墙
- usage:
  - HP 800 (放置时 50%)
  - 锤击 3次
  - 可用铥矿修复

## armorgrass
- armor_hp: 157.5 (150×1.5×0.7)
- absorption: 0.6
- usage:
  - 可作为燃料使用
  - `[pvp]` 海狸变身额外伤害易伤 (+17)

## armorwood
- armor_hp: 315 (150×3×0.7)
- absorption: 0.8
- usage:
  - 可作为燃料使用
  - `[pvp]` 海狸变身额外伤害易伤 (+17)

## armormarble
- armor_hp: 735 (150×7×0.7)
- absorption: 0.95
- speed_mult: 0.7 (移动速度降低30%)

## armor_bramble
- armor_hp: 525 (150×5×0.7)
- absorption: 0.8
- usage:
  - 被击时荆棘反击 ~22.7 伤害
  - `[角色]` 沃姆伍德专用
  - 可作为燃料使用
  - `[pvp]` 海狸变身额外伤害易伤 (+17)

## armordragonfly
- armor_hp: 945 (150×9×0.7)
- absorption: 0.7
- dapperness: 0.0278
- usage:
  - 火焰伤害完全免疫 (100% 减免)
  - 被击时点燃攻击者

## armor_sanity
- armor_hp: 525 (150×5×0.7)
- absorption: 0.95
- dapperness: -0.1042/秒 (每分钟 -6.25, 每天 -50)
- usage:
  - 装备时理智持续降低 (每分钟 -6.25)
  - 被击时伤害的10%转化为理智降低
  - 暗影等级 2

## armordreadstone
- armor_hp: 840 (150×8×0.7)
- absorption: 0.9
- planar_def: 5
- usage:
  - 理智越低耐久自动再生 (每秒, 比例基于理智插值)
  - 再生时理智降低 (每分钟 -12.5, 每天 -100)
  - 暗影属性抗性 90%
  - 暗影等级 2
  - `[套装]` 恐惧石套装加成 (再生 1.5倍)

## armorruins
- armor_hp: 1260 (150×12×0.7)
- absorption: 0.9
- dapperness: 0.0347
- usage:
  - 暗影等级 2

## armorwagpunk
- armor_hp: 730 (150×6×0.7 + 20×5 = 630+100)
- absorption: 0.85
- planar_def: 5
- usage:
  - 电击免疫
  - 追踪目标时移动速度阶段性提升 (10%→15%→20%→30%, 各阶段命中数: 10/16/20)
  - 与W.A.R.B.I.S.头盔共享目标同步
  - `[修复]` 自动修复-0(瓦格朋克修复套件)修复 (耐久度 100% 恢复)

## armor_lunarplant
- armor_hp: 830 (150×6×0.7 + 20×10 = 630+200)
- absorption: 0.8
- planar_def: 10
- usage:
  - 被击时维度反射 10 (暗影敌人对象 20)
  - 月亮属性抗性 90%
  - `[套装]` 亮茄套装加成 (额外月亮抗性)
  - `[修复]` 月亮植物修复套件修复 (耐久度 100% 恢复)
  - `[角色]` 沃姆伍德装备时额外荆棘效果 (`[技能树]` 联动)

## armor_voidcloth
- armor_hp: 830 (150×6×0.7 + 20×10 = 630+200)
- absorption: 0.8
- planar_def: 10
- usage:
  - 暗影属性抗性 90%
  - 暗影等级 3
  - `[套装]` 虚空布套装加成 (额外暗影抗性 + 维度伤害累积: 每次命中 +4 最大 +24(6次命中), 3秒未命中时全部重置)
  - `[修复]` 虚空布修复套件修复 (耐久度 100% 恢复)

## footballhat
- armor_hp: 315 (150×3×0.7)
- absorption: 0.8
- waterproof: 0.2

## woodcarvedhat
- armor_hp: 262.5 (150×2.5×0.7)
- absorption: 0.7
- usage:
  - 可作为燃料使用
  - 被击抗性
  - `[pvp]` 海狸变身额外伤害易伤 (+17)

## beehat
- armor_hp: 1050 (150×10×0.7)
- absorption: 0.8
- waterproof: 0.2
- insulation: 60
- dapperness: 0.0111
- fuel_time: 2400 (5天)
- usage:
  - 仅对蜜蜂攻击生效

## cookiecutterhat
- armor_hp: 525 (150×5×0.7)
- absorption: 0.7
- waterproof: 0.35

## wathgrithrhat
- armor_hp: 525 (150×5×0.7)
- absorption: 0.8
- waterproof: 0.2
- usage:
  - `[角色]` 女武神专用

## wathgrithr_improvedhat
- armor_hp: 682.5 (150×6.5×0.7)
- absorption: 0.8
- waterproof: 0.35
- insulation: 60
- usage:
  - `[角色]` 女武神专用
  - `[技能树]` "坚固头盔 I/II": 耐久消耗减少 10%/20%
  - `[技能树]` "指挥官头盔强化 I": 维度防御 +8
  - `[技能树]` "指挥官头盔强化 II": 生命值满时战斗自动修复

## ruinshat
- armor_hp: 840 (150×8×0.7)
- absorption: 0.9
- usage:
  - 33% 概率触发力场 (持续 4秒, 冷却 5秒)
  - 力场期间被击时伤害的 5% 转化为理智降低
  - 暗影等级 2

## dreadstonehat
- armor_hp: 840 (150×8×0.7)
- absorption: 0.9
- planar_def: 5
- waterproof: 0.2
- usage:
  - 理智越低耐久自动再生 (每秒, 与恐惧石甲相同逻辑)
  - 再生时理智降低 (每分钟 -12.5, 每天 -100)
  - 暗影属性抗性 90%
  - 暗影等级 2
  - `[套装]` 恐惧石套装加成

## lunarplanthat
- armor_hp: 830 (150×6×0.7 + 20×10 = 830)
- absorption: 0.8
- planar_def: 10
- waterproof: 0.35
- usage:
  - 月亮属性抗性 90%
  - `[套装]` 亮茄套装加成 (激活时维度伤害累积: 每次命中 +4 最大 +24(6次命中), 3秒未命中时全部重置)
  - `[修复]` 月亮植物修复套件修复 (耐久度 100% 恢复)

## voidclothhat
- armor_hp: 830 (150×6×0.7 + 20×10 = 830)
- absorption: 0.8
- planar_def: 10
- usage:
  - 暗影属性抗性 90%
  - 暗影等级 3
  - `[套装]` 虚空布套装加成
  - `[修复]` 虚空布修复套件修复 (耐久度 100% 恢复)

## wagpunkhat
- armor_hp: 730 (150×6×0.7 + 20×5 = 730)
- absorption: 0.85
- planar_def: 5
- usage:
  - 电击免疫
  - 追踪目标时移动速度阶段性提升 (5%→10%→15%→20%)
  - 与W.A.R.B.I.S.铠甲共享目标同步
  - `[修复]` 自动修复-0(瓦格朋克修复套件)修复 (耐久度 100% 恢复)

## wathgrithr_shield
- armor_hp: 420 (150×4×0.7)
- absorption: 0.85
- damage: 51 (34×1.5)
- usage:
  - `[角色]` 女武神专用
  - 可格挡 (范围 178度, 持续 1秒)
  - 格挡成功时冷却减少 70%
  - 冷却 10秒 (装备时 2秒)
  - 格挡时护甲耐久消耗 3
  - `[技能树]` 格挡额外伤害强化可用

## beefalo_groomer
- 类型: 建筑
- usage:
  - 锤击 6次
  - 皮弗娄牛绑定 + 皮肤更换

## saddle_basic
- 类型: 装备
- usage:
  - 耐久度 5
  - 移动速度 ×1.4
  - 额外伤害 +0

## saddle_race
- 类型: 装备
- usage:
  - 耐久度 8
  - 移动速度 ×1.55
  - 额外伤害 +0

## saddle_war
- 类型: 装备
- usage:
  - 耐久度 8
  - 移动速度 ×1.25
  - 额外伤害 +16

## saltlick
- 类型: 建筑
- usage:
  - 锤击 3次
  - 240次舔舐 (15天)
  - 皮弗娄牛驯化加速

## saltlick_improved
- 类型: 建筑
- usage:
  - 锤击 3次
  - 480次舔舐 (30天)
  - 可用盐材料修复

## bathbomb
- 类型: 消耗品
- 堆叠: 20
- usage:
  - 温泉激活
  - 满月时转化为月亮玻璃

## carpentry_blade_moonglass
- 类型: 木工台零件
- usage:
  - 解锁木工 Lv3

## chesspiece_butterfly_sketch
- 类型: 图纸
- usage:
  - 解锁雕像配方

## chesspiece_moon_sketch
- 类型: 图纸
- usage:
  - 解锁雕像配方

## lunar_forge_kit
- 类型: 安装套件
- usage:
  - 安装 → 大黄锻造台 (月亮冶炼 Lv2)
  - 锤击 4次

## multiplayer_portal_moonrock_constr_plans
- 类型: 建设计划书
- usage:
  - 传送门月岩升级建设计划书

## turf_fungus_moon
- 类型: 地板材料
- 堆叠: 20

## turf_meteor
- 类型: 地板材料
- 堆叠: 20

## waxwelljournal
- 噩梦燃料类型燃料 720, 每次施法 -36 燃料 (最多 20次)
- 4种法术: 工人 / 守卫 / 陷阱 / 柱子
- 施法时理智 -15 (工人·守卫除外)
- 材料: 莎草纸×2 + 噩梦燃料×2 + 生命值 50
- usage: 麦斯威尔专用暗影复制体召唤综合道具

## slingshotammo_container
- 6格弹药专用背包
- usage: 沃尔特专用弹药携带容量扩展

## walter_rope
- 草2个制作绳索 (普通需3个)
- 堆叠: 20
- usage: 沃尔特专用高效配方

## woby_treat
- 干怪物肉1个 → 2个产出
- 沃比饱食度3倍恢复
- 堆叠: 40
- usage: 沃尔特专用沃比食物

## pocketwatch_heal
- 年龄逆转8年 + HP 20 恢复
- 冷却: 120秒
- usage: 旺达年龄管理 + 恢复

## pocketwatch_parts
- 材料: 铥矿碎片×8 + 噩梦燃料×2
- usage: 其他手表制作材料 (无功能)

## pocketwatch_portal
- 位置标记 → 传送门开启 (10秒)
- 通过消耗: 理智 -20
- usage: 旺达传送门创建

## pocketwatch_recall
- 位置标记 → 瞬间移动
- 冷却: 480秒 (1天)
- 洞穴 ↔ 地上可移动
- usage: 旺达远距离移动

## pocketwatch_revive
- 自我复活 (幽灵 → 原始状态) + 他人复活
- 冷却: 240秒
- usage: 旺达复活手段

## pocketwatch_warp
- 移动到过去位置 (年龄对应距离: 年轻 8 / 普通 4 / 老年 2)
- 冷却: 2秒
- usage: 旺达短距离闪避技

## portablecookpot_item
- 放置型, 烹饪速度快20% (烹饪时间倍率 0.8)
- 锤击2次拆解
- usage: 沃利便携式烹饪锅

## portableblender_item
- 放置型, 食材加工制作台
- 锤击2次拆解
- usage: 沃利专用食材加工器

## portablespicer_item
- 放置型, 调味料 + 烹饪
- 锤击2次拆解
- usage: 沃利调味料应用烹饪

## spicepack
- BODY 槽位背包 6格
- 防腐
- usage: 沃利材料/调味料保管

## armor_lunarplant_husk
- 耐久度: 830, 吸收: 80%, 维度防御: 10, 月亮伤害抗性: 90%
- 被击时维度反射 10 (暗影 +20), 荆棘效果
- usage: 沃姆伍德专用 (女武神数据中包含)

## saddle_wathgrithr
- uses: 6, 移动速度: 1.3, 伤害 +5, 吸收 40%
- usage: 女武神专用, 技能树联动

## spider_healer_item
- 韦伯 HP +8
- 周围蜘蛛 HP +80 (半径 5)
- 堆叠: 20
- usage: 韦伯专用自身 + 蜘蛛恢复

## spidereggsack
- 安装时生成蜘蛛巢
- 堆叠 10, 燃料 180
- usage: 韦伯专用蜘蛛巢安装

## abigail_flower
- 召唤/归还切换, 法术轮盘指令, 药剂适用对象
- usage: 温蒂专用阿比盖尔召唤工具

## ghostflowerhat
- dapperness: +0.056, perish: 4800 (10天)
- 药剂效果适用
- usage: 温蒂专用, 技能树联动

## elixir_container
- 3×3 容器
- usage: 温蒂专用药剂保管

## graveurn
- 墓碑移动工具
- usage: 温蒂专用, 技能树联动

## sisturn
- 建筑, 花4格
- 理智光环 +200/天 (拥有技能时 +320)
- usage: 温蒂专用, 技能树联动

## wendy_resurrectiongrave
- 复活建筑, HP -40 联动消耗
- usage: 温蒂专用复活祭坛

## balloon
- 手部槽位装备, 9种形状随机
- usage: 韦斯专用表演道具

## balloonparty
- 弄破时恢复理智 (派对规模成比例, 2秒tick)
- usage: 韦斯专用理智恢复

## balloonspeed
- 移动速度 1.0 → 1.3 (燃料成比例), 燃料: 120秒
- usage: 韦斯专用移动增益气球

## bookstation
- 建筑, 20格书籍专用
- 每30秒恢复耐久度1% (薇克巴顿附近 ×2 速度)
- 书籍制作制作台
- usage: 薇克巴顿专用书籍保管及耐久恢复

## bernie_inactive
- 手部装备, dapperness: +0.033, 保暖: 60
- 燃料: 2400 (实际 15天)
- 疯狂时激活变身 (HP 1000, 攻击 50)
- usage: 薇洛专用疯狂守护道具

## lighter
- 武器伤害: 17, 点火概率: 50%
- 燃料: 600 (1.25天), 可烹饪
- usage: 薇洛专用点火 + 近战武器

## winona_battery_low
- 燃料: 180秒, 消耗率: 0.375 (实际 480秒 = 1天)
- 供给范围: 6.6
- usage: 薇诺娜专用电力供给 (小型)

## winona_battery_high
- 燃料: 2880秒 (6天), 宝石充电, 过载保护
- usage: 薇诺娜专用电力供给 (大型)

## winona_spotlight
- 电力消耗: 0.5 (开启) / 0.05 (关闭)
- 半径: 4.27 ~ 24
- usage: 薇诺娜专用远程照明

## winona_storage_robot
- 工作半径: 15, 移动速度: 5, 燃料: 480秒 (1天)
- usage: 薇诺娜专用自动搬运机器人

## winona_teleport_pad_item
- 待机电力: 0.05, 传送消耗可变
- usage: 薇诺娜专用团队移动站

## mighty_gym
- 建筑, 重量品质对应训练效率: LOW 4 / MED 6.67 / HIGH 10 mightiness/次
- 饱食度消耗: 4 / 11 / 22
- usage: 沃尔夫冈专用强化训练

## wolfgang_whistle
- 指导增益 ×2, 激励耗时 7秒, 增益持续 10秒
- usage: 沃尔夫冈专用团队指导

## livinglog
- 资源, 燃料: 45, 船修复: 37.5
- 堆叠: 20
- usage: 伍迪专用资源 (变身时可获取)

## compostwrap
- 肥料: 1800, 土壤周期: 20, 营养素: {24, 32, 24}
- 沃姆伍德治愈: 2HP/2秒
- 堆叠: 40
- usage: 沃姆伍德专用农业肥料 + 自我恢复

## mosquitobomb
- 伤害: 59.5, 范围: 3, 召唤蚊子4只 (拥有技能时 6只)
- 堆叠: 20
- usage: 沃姆伍德专用投掷炸弹

## mosquitofertilizer
- 肥料: 300, 土壤周期: 10, 营养素: {12, 12, 12}
- 堆叠: 20
- usage: 沃姆伍德专用小型肥料

## mosquitomermsalve
- 沃特 HP +16, 鱼人 HP +100
- 堆叠: 40
- usage: 沃姆伍德专用 (沃特联动治疗)

## mosquitomusk
- 蚊子不攻击 (和平效果), 腐烂: 3840 (8天)
- usage: 沃姆伍德专用蚊子中立化

## wormwood_berrybush
- 安装植物, 3天周期, 3~4次收获
- usage: 沃姆伍德专用植物安装

## wormwood_berrybush2
- 相同 (与浆果灌木相同周期)
- usage: 沃姆伍德专用

## wormwood_juicyberrybush
- 9天周期, 3~4次收获
- usage: 沃姆伍德专用

## wormwood_sapling
- 月光树苗安装, 4天周期
- usage: 沃姆伍德专用

## wormwood_reeds
- 3天周期, 4~6次收获
- usage: 沃姆伍德专用

## wormwood_lureplant
- HP: 300, 召唤眼球草
- usage: 沃姆伍德专用防御植物

## wormwood_carrat
- HP: 25, 寿命: 3天, 最多 4只
- usage: 沃姆伍德专用植物生物

## wormwood_lightflier
- HP: 25, 寿命: 2.5天, 最多 6只, 发光
- usage: 沃姆伍德专用照明植物生物

## wormwood_fruitdragon
- HP: 600 (拥有技能时 900), 伤害: 40, 寿命: 2天, 最多 2只
- usage: 沃姆伍德专用战斗植物生物

## wortox_reviver
- 复活道具, 腐烂: 10天
- usage: 沃拓克斯专用, 技能树联动

## wortox_souljar
- 灵魂保管, 每30秒泄漏 (拥有技能时停止)
- 灵魂上限 +5
- usage: 沃拓克斯专用灵魂储存

## merm_armory
- 鱼人盔甲·帽子分配, 锤击 4次
- usage: 沃特专用鱼人军事装备

## merm_armory_upgraded
- 高级帽子分配
- usage: 沃特专用

## merm_toolshed
- 鱼人工具分配
- usage: 沃特专用

## merm_toolshed_upgraded
- 高级工具分配
- usage: 沃特专用

## mermhouse_crafted
- 召唤鱼人1只, 再生: 2天
- usage: 沃特专用鱼人召唤

## mermthrone_construction
- 投入建设材料 → 召唤鱼人王
- usage: 沃特专用鱼人王召唤

## mermwatchtower
- 召唤守卫, 再生: 0.5天 (冬天 ×12)
- usage: 沃特专用鱼人哨塔

## offering_pot
- 鱼人召集 + 喂食, 范围: 7
- usage: 沃特专用鱼人集结 + 用餐

## offering_pot_upgraded
- 高级版本
- usage: 沃特专用

## wurt_swampitem_shadow
- 暗影沼泽转换 (3格), 冷却: 480秒, 理智 -20
- usage: 沃特专用地形转换

## wurt_swampitem_lunar
- 月亮沼泽转换, 相同结构
- usage: 沃特专用地形转换

## wurt_turf_marsh
- 沼泽地板4张制作
- usage: 沃特专用沼泽地板

## backpack
- slots: 8

## piggyback
- slots: 12
- speed_mult: 0.9 (移动速度降低10%)

## icepack
- slots: 8
- perishable_mod: 0.5 (腐烂速度降低50%, 冷藏效果)

## seedpouch
- slots: 14
- perishable_mod: 0.5 (腐烂速度降低50%, 保鲜效果)

## balloonhat
- dapperness: +0.022/s
- fuel_time: 480s (1天)
- waterproofness: 0.2
- usage:
  - 雷击伤害免疫
  - 被击时爆炸 (爆裂 → 销毁)

## beefalohat
- insulation: 240
- waterproofness: 0.2
- fuel_time: 4800s (10天)
- usage:
  - 皮弗娄牛不敌对

## catcoonhat
- insulation: 60
- dapperness: +0.056/s
- fuel_time: 4800s (10天)

## deserthat
- summer_insulation: 120
- waterproofness: 0.2
- dapperness: +0.056/s
- fuel_time: 4800s (10天)
- usage:
  - 赋予护目镜效果

## earmuffshat
- insulation: 60
- fuel_time: 2400s (5天)

## eyebrellahat
- waterproofness: 1.0 (完全防水)
- summer_insulation: 240
- fuel_time: 4320s (9天)
- usage:
  - 雷击伤害免疫
  - 赋予雨伞效果

## featherhat
- dapperness: +0.033/s
- fuel_time: 3840s (8天)

## flowerhat
- dapperness: +0.022/s
- fuel_time: 2880s (6天)
- usage:
  - 对鱼人效果反转 (敌对 → 非敌对)

## goggleshat
- dapperness: +0.056/s
- fuel_time: 4800s (10天)
- usage:
  - 赋予护目镜效果 (无防护效果)

## icehat
- summer_insulation: 240
- speed_mult: 0.9 (移动速度降低10%)
- perish: 3840s (8天)
- usage:
  - 穿戴中冷却 -40 (体温下降)
  - 湿度 +1/s (最大 49%)
  - 可用冰块修复

## inspectacleshat
- usage:
  - 探测周围游戏信号, 每5秒刷新
  - 需要薇诺娜专用技能

## kelphat
- dapperness: -0.022/s (鱼人穿戴时反转)
- perish: 2880s (6天)

## mermhat
- dapperness: -0.022/s
- perish: 7200s (15天)
- usage:
  - 鱼人不敌对

## blue_mushroomhat
- summer_insulation: 60
- waterproofness: 0.2
- hunger_rate: 0.75 (降低25%)
- perish: 2880s (6天)
- usage:
  - 穿戴中释放蓝色孢子

## green_mushroomhat
- summer_insulation: 60
- waterproofness: 0.2
- hunger_rate: 0.75 (降低25%)
- perish: 2880s (6天)
- usage:
  - 穿戴中释放绿色孢子

## red_mushroomhat
- summer_insulation: 60
- waterproofness: 0.2
- hunger_rate: 0.75 (降低25%)
- perish: 2880s (6天)
- usage:
  - 穿戴中释放红色孢子

## moon_mushroomhat
- summer_insulation: 60
- waterproofness: 0.2
- hunger_rate: 0.75 (降低25%)
- perish: 2880s (6天)
- usage:
  - 释放月亮孢子 (1.5秒间隔, 比普通蘑菇帽更快)
  - 被击时额外释放3个月亮孢子
  - 赋予月亮孢子保护效果

## moonstorm_goggleshat
- dapperness: +0.056/s
- waterproofness: 0.2
- fuel_time: 480s (1天)
- usage:
  - 赋予护目镜效果
  - 月风暴探测功能

## nutrientsgoggleshat
- summer_insulation: 60
- shadowlevel: 1
- usage:
  - 植物检查功能
  - 土壤营养可视化

## polly_rogershat
- waterproofness: 0.35
- fuel_time: 2880s (6天)
- usage:
  - 穿戴时召唤鹦鹉(Polly Rogers) — 自动拾取周围物品
  - 鹦鹉死亡后1天复活
  - 服务器迁移时鹦鹉保持

## pumpkinhat
- waterproofness: 0.2
- perish: 3840s (8天, 万圣节活动期间 7200s)
- usage:
  - 黑暗导致的理智降低免疫
  - 幽灵伤害免疫

## rainhat
- waterproofness: 0.7
- fuel_time: 4800s (10天)
- usage:
  - 雷击伤害免疫

## roseglasseshat
- dapperness: +0.022/s
- usage:
  - 薇诺娜专用
  - 技能树联动 (近距离检查 / 虫洞追踪)

## strawhat
- summer_insulation: 60
- waterproofness: 0.2
- fuel_time: 2400s (5天)
- usage:
  - 可作为燃料使用

## tophat
- waterproofness: 0.2
- dapperness: +0.056/s
- fuel_time: 3840s (8天)

## tophat_magician
- waterproofness: 0.2
- dapperness: +0.056/s
- fuel_time: 3840s (8天)
- shadowlevel: 2
- usage:
  - 提供暗影收纳空间

## walterhat
- summer_insulation: 60
- waterproofness: 0.2
- dapperness: +0.033/s
- fuel_time: 4800s (10天)
- usage:
  - 沃尔特专用 — 理智伤害减免50%

## watermelonhat
- summer_insulation: 120
- waterproofness: 0.2
- dapperness: -0.033/s
- perish: 1440s (3天)
- usage:
  - 穿戴中冷却 -55 (体温下降)
  - 湿度 +0.5/s

## winterhat
- insulation: 120
- dapperness: +0.022/s
- fuel_time: 4800s (10天)

## bushhat
- usage:
  - 隐藏功能 — 不被敌人探测

## armorslurper
- hunger_rate: 0.6 (降低40%)
- dapperness: +0.033/s
- fuel_time: 3840s (8天)
- shadowlevel: 2
- usage:
  - 无防御效果

## beargervest
- insulation: 240
- dapperness: +0.074/s
- hunger_rate: 0.75 (降低25%)
- fuel_time: 3360s (7天)

## hawaiianshirt
- summer_insulation: 240
- dapperness: +0.056/s
- perish: 7200s (15天)

## onemanband
- dapperness: -0.033/s (基础; 每位追随者额外降低)
- fuel_time: 180s
- shadowlevel: 1
- usage:
  - 追随者探测范围: 12
  - 最大追随者数: 10

## raincoat
- waterproofness: 1.0 (完全防水)
- insulation: 60
- fuel_time: 4800s (10天)
- usage:
  - 雷击伤害免疫

## reflectivevest
- summer_insulation: 120
- waterproofness: 0.2
- dapperness: +0.033/s
- fuel_time: 3840s (8天)

## sweatervest
- insulation: 60
- dapperness: +0.056/s
- fuel_time: 4800s (10天)

## trunkvest_summer
- summer_insulation: 60
- waterproofness: 0.2
- dapperness: +0.033/s
- fuel_time: 7200s (15天)

## trunkvest_winter
- insulation: 240
- dapperness: +0.033/s
- fuel_time: 7200s (15天)

## featherfan
- uses: 15次
- usage:
  - 范围 7 内冷却 -50度 (最低体温 2.5度)
  - 可扑灭范围内火焰

## grass_umbrella
- waterproofness: 0.5
- summer_insulation: 120
- dapperness: +0.033/s
- perish: 960s (2天)
- usage:
  - 可作为燃料使用

## minifan
- damage: 17
- fuel_time: 90s
- usage:
  - 仅移动中激活: 冷却 -55 + 散热 +60
  - 静止时冷却/散热不激活

## umbrella
- waterproofness: 0.9
- summer_insulation: 120
- fuel_time: 2880s (6天)

## voidcloth_umbrella
- waterproofness: 1.0 (完全防水)
- summer_insulation: 240
- dapperness: -0.056/s
- fuel_time: 7200s (15天)
- shadowlevel: 3
- usage:
  - 酸雨 / 月冰雹伤害免疫
  - 穹顶功能: 半径 16 范围保护 (使用时耐久消耗 1.5倍)
  - 损坏时可修复
  - 专用修复套件修复

## winona_telebrella
- waterproofness: 0.35
- fuel_time: 7200s (15天, 电池充电方式)
- usage:
  - 传送功能 (消耗 1天份燃料)
  - 薇诺娜专用
  - 技能树联动

## balloonvest
- fuel_time: 480s (1天)
- usage:
  - 防止溺水
  - 被击时爆炸 (爆裂 → 销毁)

## cookbook
- 功能: 打开食谱弹窗
- 燃料持续: 45秒

## cookpot
- 种类: 建筑
- 槽位数: 4
- 基础烹饪时间: ~20秒 (按配方倍率)
- 锤击次数: 4次

## meatrack
- 种类: 建筑
- 槽位数: 3 (可晾干物品专用)
- 晾干时间: 0.5~2天 (按物品不同)
- 特殊: 下雨时停止
- 锤击次数: 4次

## spice_chili
- 堆叠: 40
- 增益: 攻击力 ×1.2, 持续 240秒
- 体温: +40

## spice_garlic
- 堆叠: 40
- 增益: 伤害吸收 33.3%, 持续 240秒

## spice_salt
- 堆叠: 40
- 效果: 生命恢复 +25% (立即生效, 无增益)

## spice_sugar
- 堆叠: 40
- 增益: 工作效率 ×2, 持续 240秒

## wintersfeastoven
- 种类: 建筑
- 特殊: 冬季盛宴专用
- 基础烹饪时间: ~20秒
- 制作站: 制作台 (WINTERSFEASTCOOKING)
- 锤击次数: 4次

## portablefirepit_item
- 参照: character.md

## critter_dragonling_builder
- 召唤宠物: dragonling
- 移动: 飞行
- 喜欢的食物: 辣椒酱

## critter_eyeofterror_builder
- 召唤宠物: eyeofterror
- 移动: 飞行
- 喜欢的食物: 培根煎蛋

## critter_glomling_builder
- 召唤宠物: glomling
- 移动: 飞行
- 喜欢的食物: 太妃糖

## critter_kitten_builder
- 召唤宠物: kitten
- 移动: 地面
- 喜欢的食物: 鱼条

## critter_lamb_builder
- 召唤宠物: lamb
- 移动: 地面
- 喜欢的食物: 鳄梨酱

## critter_lunarmothling_builder
- 召唤宠物: lunarmothling
- 移动: 飞行
- 喜欢的食物: 花沙拉

## critter_perdling_builder
- 召唤宠物: perdling
- 移动: 地面
- 喜欢的食物: 什锦干果

## critter_puppy_builder
- 召唤宠物: puppy
- 移动: 地面
- 喜欢的食物: 怪物千层面

## wall_hay_item
- 类型: 墙 (放置型)
- 堆叠: 20
- 最大 HP: 100
- 安装时 HP: 50
- 锤击次数: 3次
- 修复材料: 草 (每个约恢复 16.7)
- 锤击掉落物: 草 (HP成比例, 最多 2个)
- 可燃性: 是

## wall_wood_item
- 类型: 墙 (放置型)
- 堆叠: 20
- 最大 HP: 200
- 安装时 HP: 100
- 锤击次数: 3次
- 修复材料: 木头 (每个约恢复 33.3)
- 锤击掉落物: 木头 (HP成比例, 最多 2个)
- 可燃性: 是

## wall_stone_item
- 类型: 墙 (放置型)
- 堆叠: 20
- 最大 HP: 400
- 安装时 HP: 200
- 锤击次数: 3次
- 修复材料: 石头 (每个约恢复 66.7)
- 锤击掉落物: 石头 (HP成比例, 最多 2个)
- 可燃性: 火灾免疫

## wall_moonrock_item
- 类型: 墙 (放置型)
- 堆叠: 20
- 最大 HP: 600
- 安装时 HP: 300
- 锤击次数: 25次
- 修复材料: 月岩碎片 (每个恢复 100)
- 锤击掉落物: 月岩碎片 (HP成比例, 最多 2个)
- 可燃性: 火灾免疫
- usage:
  - 玩家伤害降低75%

## wall_dreadstone_item
- 类型: 墙 (放置型)
- 堆叠: 20
- 最大 HP: 800
- 安装时 HP: 400
- 锤击次数: 25次
- 修复材料: 恐惧石 (每个恢复 320)
- 锤击掉落物: 恐惧石 (HP成比例, 最多 2个)
- 可燃性: 火灾免疫
- usage:
  - 玩家伤害降低75%

## wall_scrap_item
- 类型: 墙 (放置型)
- 堆叠: 20
- 最大 HP: 600
- 安装时 HP: 300
- 锤击次数: 10次
- 修复材料: 齿轮 (每个恢复 320)
- 锤击掉落物: 瓦格朋克零件 (HP成比例, 最多 1个)
- 可燃性: 火灾免疫
- usage:
  - 玩家伤害降低75%

## fence_item
- 类型: 墙 (放置型)
- 堆叠: 20
- 安装时 HP: 1 (吸收所有伤害)
- 锤击次数: 3次
- usage:
  - 移动阻挡及路径寻找墙壁作用

## fence_gate_item
- 类型: 墙 (放置型)
- 堆叠: 20
- 安装时 HP: 1 (吸收所有伤害)
- 锤击次数: 3次
- usage:
  - 玩家可开关的门
  - 关闭时移动阻挡及路径寻找墙壁作用

## turf_road
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面, 道路
- usage:
  - 移动速度提升30%

## turf_cotl_brick
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面, 道路
- usage:
  - 移动速度提升30%

## turf_dragonfly
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面, 地板材料
- usage:
  - 完全阻止火灾蔓延

## turf_carpetfloor
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面, 地板材料

## turf_carpetfloor2
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面, 地板材料

## turf_checkerfloor
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面, 地板材料

## turf_cotl_gold
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面, 地板材料

## turf_woodfloor
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面, 地板材料

## turf_beard_rug
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面, 地板材料

## turf_mosaic_blue
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面, 地板材料

## turf_mosaic_grey
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面, 地板材料

## turf_mosaic_red
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面, 地板材料

## turf_archive
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面

## turf_vault
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面

## turf_rocky
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面

## turf_underrock
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面

## turf_vent
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面

## turf_ruinsbrick
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面

## turf_ruinsbrick_glow
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面

## turf_ruinstiles
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面

## turf_ruinstiles_glow
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面

## turf_ruinstrim
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面

## turf_ruinstrim_glow
- 类型: 地板砖
- 堆叠: 20
- 地面: 坚硬地面

## turf_grass
- 类型: 地板砖
- 堆叠: 20
- 地面: 柔软地面

## turf_forest
- 类型: 地板砖
- 堆叠: 20
- 地面: 柔软地面

## turf_savanna
- 类型: 地板砖
- 堆叠: 20
- 地面: 柔软地面

## turf_deciduous
- 类型: 地板砖
- 堆叠: 20
- 地面: 柔软地面

## turf_desertdirt
- 类型: 地板砖
- 堆叠: 20
- 地面: 柔软地面

## turf_marsh
- 类型: 地板砖
- 堆叠: 20
- 地面: 柔软地面

## turf_cave
- 类型: 地板砖
- 堆叠: 20
- 地面: 柔软地面

## turf_fungus
- 类型: 地板砖
- 堆叠: 20
- 地面: 柔软地面

## turf_fungus_green
- 类型: 地板砖
- 堆叠: 20
- 地面: 柔软地面

## turf_fungus_red
- 类型: 地板砖
- 堆叠: 20
- 地面: 柔软地面

## turf_fungus_moon
- 类型: 地板砖
- 堆叠: 20
- 地面: 柔软地面

## turf_mud
- 类型: 地板砖
- 堆叠: 20
- 地面: 柔软地面

## turf_sinkhole
- 类型: 地板砖
- 堆叠: 20
- 地面: 柔软地面

## turf_pebblebeach
- 类型: 地板砖
- 堆叠: 20
- 地面: 柔软地面

## turf_shellbeach
- 类型: 地板砖
- 堆叠: 20
- 地面: 柔软地面

## turf_meteor
- 类型: 地板砖
- 堆叠: 20
- 地面: 柔软地面

## turf_monkey_ground
- 类型: 地板砖
- 堆叠: 20
- 地面: 柔软地面

## wood_chair
- 类型: 建筑
- 锤击次数: 1次
- usage:
  - 角色可坐下
- 可燃性: 是

## wood_stool
- 类型: 建筑
- 锤击次数: 1次
- usage:
  - 角色可坐下
- 可燃性: 是

## stone_chair
- 类型: 建筑
- 锤击次数: 1次
- usage:
  - 角色可坐下
- 可燃性: 火灾免疫

## stone_stool
- 类型: 建筑
- 锤击次数: 1次
- usage:
  - 角色可坐下
- 可燃性: 火灾免疫

## hermit_chair_rocking
- 类型: 建筑
- 锤击次数: 1次
- usage:
  - 角色可坐下 (摇椅)
- 可燃性: 是

## wood_table_round
- 类型: 建筑
- 锤击次数: 5次
- usage:
  - 可放置1个桌面装饰品
- 可燃性: 是

## wood_table_square
- 类型: 建筑
- 锤击次数: 5次
- usage:
  - 可放置1个桌面装饰品
- 可燃性: 是

## stone_table_round
- 类型: 建筑
- 锤击次数: 5次
- usage:
  - 可放置1个桌面装饰品
- 可燃性: 火灾免疫

## stone_table_square
- 类型: 建筑
- 锤击次数: 5次
- usage:
  - 可放置1个桌面装饰品
- 可燃性: 火灾免疫

## endtable
- 类型: 建筑
- 锤击次数: 4次
- usage:
  - 可插花: 插入新鲜花朵时发光 (半径 1.5, 强度 0.5), 理智 +5
  - 花在 4800秒(10天)后枯萎
- 可燃性: 是

## wardrobe
- 类型: 建筑
- 锤击次数: 4次
- usage:
  - 更换角色皮肤
- 可燃性: 是

## sewing_mannequin
- 类型: 建筑
- 锤击次数: 6次
- usage:
  - 装备展示台: 可在头/身体/手槽位装备
  - 给予物品自动装备, 槽位已满时替换
  - 锤击时掉落所有装备
- 可燃性: 是

## homesign
- 类型: 建筑
- 锤击次数: 4次
- usage:
  - 可书写
- 可燃性: 是

## arrowsign_post
- 类型: 建筑
- 锤击次数: 4次
- usage:
  - 可书写
  - 可8方向旋转
- 可燃性: 是

## minisign_item
- 类型: 物品栏物品 (放置型)
- 堆叠: 10
- usage:
  - 安装后可用羽毛笔绘制物品图像
  - 用铲子回收 (非锤击而是DIG动作)
- 可燃性: 是

## pottedfern
- 类型: 建筑
- 锤击次数: 1次
- usage:
  - 纯装饰用 (随机外观 1~10 变体)
- 可燃性: 是

## succulent_potted
- 类型: 建筑
- 锤击次数: 1次
- usage:
  - 纯装饰用 (随机外观 1~5 变体)
- 可燃性: 是

## ruinsrelic_bowl
- 类型: 物品栏物品 (桌面装饰)
- 锤击次数: 1次
- usage:
  - 可放置在桌子上

## ruinsrelic_chair
- 类型: 建筑
- 锤击次数: 1次
- usage:
  - 角色可坐下 (不舒适的椅子)
  - 可在遗迹中引诱暗影幼虫

## ruinsrelic_chipbowl
- 类型: 物品栏物品 (桌面装饰)
- 锤击次数: 1次
- usage:
  - 可放置在桌子上

## ruinsrelic_plate
- 类型: 物品栏物品 (桌面装饰)
- 锤击次数: 1次
- usage:
  - 可放置在桌子上

## ruinsrelic_table
- 类型: 建筑
- 锤击次数: 1次
- usage:
  - 装饰桌子 (障碍物物理半径 0.5)

## ruinsrelic_vase
- 类型: 物品栏物品 (桌面装饰)
- 锤击次数: 1次
- usage:
  - 可放置在桌子上

## vaultrelic_bowl
- 类型: 物品栏物品 (桌面装饰)
- 锤击次数: 1次
- usage:
  - 可放置在桌子上

## vaultrelic_planter
- 类型: 物品栏物品 (桌面装饰)
- 锤击次数: 1次
- usage:
  - 可放置在桌子上

## vaultrelic_vase
- 类型: 物品栏物品 (桌面装饰)
- 锤击次数: 1次
- usage:
  - 可放置在桌子上
  - 可插花: 插入新鲜花朵时发光 (半径 1.5, 强度 0.5)

## decor_centerpiece
- 类型: 物品栏物品 (桌面装饰)
- usage:
  - 可放置在桌子上
  - 纯装饰用
- 可燃性: 是

## decor_flowervase
- 类型: 物品栏物品 (桌面装饰)
- usage:
  - 可放置在桌子上
  - 可插花: 插入新鲜花朵时发光 (半径 1.5, 强度 0.5)
  - 花在 4800秒(10天)后枯萎
- 可燃性: 是

## decor_lamp
- 类型: 物品栏物品 (桌面装饰)
- fuel: 468s (CAVE类型燃料, 使用灯泡)
- usage:
  - 可放置在桌子上
  - 燃料式照明: 根据燃料量光照半径 2~4 (强度 0.4~0.6)
  - 可开关切换
  - 放在地上自动点亮, 放入物品栏自动熄灭
- 可燃性: 是

## decor_pictureframe
- 类型: 物品栏物品 (桌面装饰)
- usage:
  - 可放置在桌子上
  - 可用羽毛笔绘制物品图像
- 可燃性: 是

## decor_portraitframe
- 类型: 物品栏物品 (桌面装饰)
- usage:
  - 可放置在桌子上
  - 纯装饰用
- 可燃性: 是

## chesspiece_anchor_sketch
- 类型: 物品栏物品 (图纸)
- usage:
  - 在陶轮上解锁锚雕像制作配方
  - 使用时消耗

## chesspiece_butterfly_sketch
- 类型: 物品栏物品 (图纸)
- usage:
  - 在陶轮上解锁月蛾雕像制作配方
  - 使用时消耗

## chesspiece_moon_sketch
- 类型: 物品栏物品 (图纸)
- usage:
  - 在陶轮上解锁"月亮"雕像制作配方
  - 使用时消耗

## chesspiece_hornucopia_builder
- 类型: 物品栏物品 (沉重物体)
- speed_mult: 0.15 (移动速度降低85%)
- 锤击次数: 1次
- usage:
  - 沉重物品 — 无法放入容器, BODY槽位装备
  - 体能重量: 3 (沃尔夫冈专用 gym)
  - 锤击时返还材料

## chesspiece_pipe_builder
- 类型: 物品栏物品 (沉重物体)
- speed_mult: 0.15 (移动速度降低85%)
- 锤击次数: 1次
- usage:
  - 沉重物品 — 无法放入容器, BODY槽位装备
  - 体能重量: 3 (沃尔夫冈专用 gym)
  - 锤击时返还材料

## phonograph
- 类型: 物品栏物品 (兼用建筑)
- 锤击次数: 1次
- usage:
  - 插入唱片后播放音乐 (64秒)
  - 播放中半径 8 内农作物管理效果
  - 可放置在桌子上
  - 物品栏携带时停止播放

## record
- 类型: 物品栏物品
- usage:
  - 插入留声机播放音乐
  - 变体: default, balatro 等

## pirate_flag_pole
- 类型: 建筑
- 锤击次数: 3次
- usage:
  - 纯装饰用 (随机旗帜外观 1~4 变体)
- 可燃性: 是

## winter_treestand
- 类型: 建筑
- 锤击次数: 1次
- usage:
  - 冬季盛宴树苗种植用花盆
  - 种植树苗后建筑本身消失并成长为冬季盛宴树
  - 树成长阶段: 树苗(0.5天) → 幼年(1天) → 中年(1天) → 大型(1天)
  - 大型树提供装饰品容器槽位
- 可燃性: 是

## chum
- 堆叠: 20
- 效果: 投入海中时召唤鱼类 20秒
- 引诱半径: 16

## bobber_ball
- 堆叠: 40
- 抛投距离: 9
- 精确度: 0.80~1.20
- 角度误差: ±20°

## bobber_oval
- 堆叠: 40
- 抛投距离: 11
- 精确度: 0.80~1.20
- 角度误差: ±20°

## bobber_crow
- 堆叠: 40
- 抛投距离: 9
- 精确度: 0.85~1.15
- 角度误差: ±15°

## bobber_robin
- 堆叠: 40
- 抛投距离: 9
- 精确度: 0.85~1.15
- 角度误差: ±15°

## bobber_robin_winter
- 堆叠: 40
- 抛投距离: 9
- 精确度: 0.85~1.15
- 角度误差: ±15°

## bobber_canary
- 堆叠: 40
- 抛投距离: 9
- 精确度: 0.85~1.15
- 角度误差: ±15°

## bobber_goose
- 堆叠: 40
- 抛投距离: 13
- 精确度: 0.95~1.05
- 角度误差: ±5°

## bobber_malbatross
- 堆叠: 40
- 抛投距离: 13
- 精确度: 0.95~1.05
- 角度误差: ±5°

## lure_hermit_drowsy
- 堆叠: 40
- 引诱半径: 3
- 魅力度: 0.1
- 收线速度: +0.3
- 抛投距离: +1
- 条件: 全天候
- 特殊: 消耗生命值

## lure_hermit_heavy
- 堆叠: 40
- 引诱半径: 5
- 魅力度: 0.5
- 收线速度: 0
- 抛投距离: +1
- 条件: 全天候
- 特殊: 对重鱼(80%+)额外魅力

## lure_hermit_rain
- 堆叠: 40
- 引诱半径: 5
- 魅力度: 0.3
- 收线速度: +0.5
- 抛投距离: +1
- 条件: 雨天专用

## lure_hermit_snow
- 堆叠: 40
- 引诱半径: 5
- 魅力度: 0.3
- 收线速度: +0.5
- 抛投距离: +1
- 条件: 雪天专用

## lure_spinner_blue
- 堆叠: 40
- 引诱半径: 5
- 魅力度: 0.4
- 收线速度: +0.4
- 抛投距离: +2
- 条件: 夜间特化

## lure_spinner_green
- 堆叠: 40
- 引诱半径: 5
- 魅力度: 0.4
- 收线速度: +0.4
- 抛投距离: +2
- 条件: 黄昏特化

## lure_spinner_red
- 堆叠: 40
- 引诱半径: 5
- 魅力度: 0.4
- 收线速度: +0.4
- 抛投距离: +2
- 条件: 白天特化

## lure_spoon_blue
- 堆叠: 40
- 引诱半径: 4
- 魅力度: 0.2
- 收线速度: +0.3
- 抛投距离: +1
- 条件: 夜间特化

## lure_spoon_green
- 堆叠: 40
- 引诱半径: 4
- 魅力度: 0.2
- 收线速度: +0.3
- 抛投距离: +1
- 条件: 黄昏特化

## lure_spoon_red
- 堆叠: 40
- 引诱半径: 4
- 魅力度: 0.2
- 收线速度: +0.3
- 抛投距离: +1
- 条件: 白天特化

## trophyscale_fish
- 类型: 建筑
- 锤击次数: 4次
- 功能: 鱼类重量测量及记录

## beebox
- 类型: 建筑
- 蜂蜜最大: 6
- 蜜蜂: 4只
- 蜜蜂再生: 120秒
- 锤击: 4次

## birdcage
- 类型: 建筑
- 鸟类保管
- 转化: 肉 → 蛋, 种子 → 种子
- 锤击: 4次

## compostingbin
- 类型: 建筑
- 容量: 材料 6个
- 产出: 堆肥 1个 / 240~480秒
- 锤击: 4次

## farm_plow_item
- 类型: 工具
- 使用次数: 4
- 效果: 地块 → 农田泥土转换
- 耕作时间: 15秒

## fertilizer
- 类型: 工具
- 使用次数: 10
- 效果: 肥料 300秒
- 营养素: 堆肥 0 / 生长促进剂 0 / 粪肥 16

## mushroom_farm
- 类型: 建筑
- 收获: 4次
- 生长时间: 1800秒
- 修复材料: 活木
- 锤击: 3次

## ocean_trawler_kit
- 类型: 水上建筑
- 槽位: 4
- 自动捕获: 12.5% / 0.75秒
- 使用诱饵时: 捕获率2倍
- 保存: 10倍

## soil_amender
- 类型: 发酵物品 (3阶段)
- 新鲜: 营养素 堆肥 8 / 生长促进剂 0 / 粪肥 0
- 熟成: 营养素 堆肥 16 / 生长促进剂 0 / 粪肥 0
- 发酵: 营养素 堆肥 32 / 生长促进剂 0 / 粪肥 0
- 使用次数: 5 (发酵后)

## treegrowthsolution
- 类型: 工具
- 堆叠: 10
- 效果: 肥料 + 树木生长 + 船修复 20 HP
- 营养素: 堆肥 8 / 生长促进剂 32 / 粪肥 8

## trophyscale_oversizedveggies
- 类型: 建筑
- 效果: 大型作物重量测量
- 保持最高记录
- 锤击: 4次

## bandage
- 生命值: +30 HP (即时恢复)
- 使用次数: 1 (1次消耗)
- 堆叠: 40

## bedroll_straw
- 堆叠: 10
- 睡眠效果 (每秒):
  - 生命值: +0.5/秒
  - 理智: +0.667/秒
  - 饱食度: -1/秒
- 温度调节: 无

## bedroll_furry
- 使用次数: 3
- 睡眠效果 (每秒):
  - 生命值: +1/秒
  - 理智: +1/秒
  - 饱食度: -1/秒
- 保暖: 温度维持 30~45°C

## healingsalve
- 生命值: +20 HP (即时恢复)
- 使用次数: 1 (1次消耗)
- 堆叠: 40

## healingsalve_acid
- 生命值: +20 HP (即时恢复)
- 使用次数: 1 (1次消耗)
- 堆叠: 40
- 额外效果: 使用后酸雨免疫 240秒

## lifeinjector
- 效果: 移除最大HP惩罚25%
- 使用次数: 1 (1次消耗)
- 堆叠: 40

## reviver
- 效果: 复活幽灵状态的玩家
- 复活理智: 被复活玩家 +80 SAN
- 惩罚: 复活对象最大HP 25%惩罚
- 使用次数: 1 (1次消耗)

## tillweedsalve
- 生命值: +8 HP (即时) + +1 HP/3秒 × 60秒 = +20 HP (持续), 合计 +28 HP
- 使用次数: 1 (1次消耗)
- 堆叠: 40

## lantern
- 装备槽位: 手 (手部)
- 燃料持续: 468秒 (洞穴燃料基准)
- 光照半径: 3~5 (燃料量成比例)
- 燃料补充: 可

## molehat
- 装备槽位: 头部
- 燃料类型: 虫光
- 燃料持续: 720秒 (1.5天)
- 效果: 夜视
- 耗尽时: 物品移除

## mushroom_light
- 类型: 建筑
- 槽位数: 4 (光电池专用)
- 光照半径: 2.5~5.5 (插入的电池数成比例)
- 腐烂速度: 25% (相对普通)
- 锤击次数: 3次

## mushroom_light2
- 类型: 建筑
- 槽位数: 4 (光电池 + 孢子专用)
- 光照半径: 2.5~5.5
- 孢子槽位: 可更换颜色
- 腐烂速度: 25% (相对普通)
- 锤击次数: 3次

## pumpkin_lantern
- 发光条件: 仅夜晚/黄昏发光
- 光照半径: 1.5
- 腐烂时间: 4800秒 (万圣节活动期间 19200秒)
- 腐烂: 仅放在地上时腐烂进行

## torch
- 装备槽位: 手 (手部)
- 燃料持续: 75秒
- 光照半径: 2 (技能适用时最大 5)
- 伤害: 17 (基础攻击力的 50%)
- 点火率: 100% (敌人点火)
- 非消耗倍率: 1.5× (火焰相关技能)
- 防水: 20%
- 投掷: 可

## beargerfur_sack
- 类型: 容器
- usage:
  - 内部食物保质期延长20倍 (腐烂速度 ×0.05)

## deerclopseyeball_sentryward_kit
- 类型: 建筑
- usage:
  - 锤击 4次
  - 地图公开
  - 半径 35 内环境温度固定为 -10度 (无视季节)
  - 每7~12天产出6个冰块

## lunarplant_kit
- 类型: 修复套件
- usage:
  - 月亮植物材质修复套件

## blueamulet
- fuel: 360s (MAGIC)
- dapperness: +0.033/s
- usage:
  - 穿戴时冷却穿戴者 (热源 -20, 夏季体温降低)
  - 被击时对攻击者施加冷气 (冷气 +0.67) + 燃料消耗 3%

## greenamulet
- uses: 5
- dapperness: +0.033/s
- usage:
  - 制作时仅消耗 50% 材料

## orangeamulet
- uses: 225
- dapperness: +0.033/s
- usage:
  - 每0.33秒自动拾取半径 4 内物品
  - 可用噩梦燃料修复 (每个恢复耐久度 50)

## purpleamulet
- fuel: 192s (MAGIC), 装备中持续消耗
- dapperness: -0.056/s (每分钟 -3.3, 每天 -26.7)
- usage:
  - 装备时理智强制显示为0 — 实际理智保持, 仅判定/UI显示为0
  - 因此进入疯狂状态 — 暗影生物出现/攻击
  - 卸下装备时恢复原理智数值 (但因装备期间理智降低效果, 实际理智也会降低, 长时间穿戴后卸下时理智会偏低)

## yellowamulet
- fuel: 480s (噩梦燃料类型), 装备中持续消耗
- speed_mult: 1.2 (移动速度 +20%)
- dapperness: +0.033/s
- usage:
  - 发光 (半径 2, 金色光)
  - 装备中可投入噩梦燃料延长持续时间 (其他护符不可)

## greenstaff
- uses: 5
- usage:
  - 拆解有配方的建筑/物品 → 按耐久度剩余%比例返还材料 (最少保证1个, 宝石类材料不返还)
  - 使用时理智 -20

## orangestaff
- uses: 20
- damage: 17
- speed_mult: 1.25 (移动速度 +25%)
- usage:
  - 闪现 (瞬间移动)
  - 闪现时理智 -15
  - 攻击时不消耗耐久度

## telestaff
- uses: 5
- usage:
  - 将目标传送至随机位置或传送聚焦台
  - 洞穴中无法传送 (仅产生轻微震动)
  - 使用时理智 -50
  - 使用时世界降水量 +500 — 可引发降雨 (是世界降水量而非玩家湿度)

## yellowstaff
- uses: 20
- usage:
  - 在指定位置召唤矮星 (1680秒 = 3.5天持续):
  - 使用时理智 -20

## nightlight
- 类型: 建筑
- 锤击次数: 4次
- 燃料: 噩梦燃料类型
- 最大燃料: 540s
- usage:
  - 点燃时理智光环 -0.05/s

## nightmare_timepiece
- 类型: 物品栏物品
- usage:
  - 噩梦阶段状态UI显示

## nightmarefuel
- 类型: 消耗品
- 堆叠: 40
- usage:
  - 可作为噩梦燃料类型燃料使用 (燃料值 180s, 可投入暗夜灯/暗影灯等)
  - 懒人采集者修复材料 (每个恢复耐久度 50). 纯粹恐惧也可修复相同对象 (每个恢复耐久度 100). 当前源码中修复对象仅为懒人采集者.

## purplegem
- 类型: 物品栏物品
- 堆叠: 40
- usage:
  - 制作材料用

## researchlab3
- 类型: 建筑 (制作站)
- 制作站: MAGIC_TWO
- 材料: 活木×3, 紫宝石×1, 噩梦燃料×7

## researchlab4
- 类型: 建筑 (制作站)
- 制作站: MAGIC_ONE
- 材料: 兔子×4, 木板×4, 丝绸帽×1

## resurrectionstatue
- 类型: 建筑
- 锤击次数: 4次
- usage:
  - 指定复活点
  - 联动时最大HP -40

## telebase
- 类型: 建筑
- 锤击次数: 4次
- usage:
  - 插入3个紫宝石后设为传送目的地

## townportal
- 类型: 建筑
- 锤击次数: 4次
- usage:
  - 双向瞬间移动
  - 引导开始时即时理智 -15
  - 引导中理智 -0.667/s
  - 传送用户理智 -50

## moondial
- 类型: 建筑
- 锤击次数: 4次
- usage:
  - 月相对应照明变化

## moonrockidol
- 类型: 物品栏物品
- usage:
  - 接近月门半径8时发光
  - 月门激活钥匙

## leif_idol
- 类型: 消耗品
- 堆叠: 10
- 燃料: 180s
- usage:
  - 唤醒半径 20 内树精守卫
  - 将半径 10 内2棵树转化为树精守卫

## magician_chest
- 类型: 建筑
- 锤击次数: 2次
- usage:
  - 与麦斯威尔暗影空间共享的储物箱

## punchingbag_lunar
- 类型: 建筑
- 锤击次数: 6次
- HP: 10009 (即时恢复)
- alignment: 月亮阵营
- usage:
  - 可装备装备 (伤害测试用)

## punchingbag_shadow
- 类型: 建筑
- 锤击次数: 6次
- HP: 10009 (即时恢复)
- alignment: 暗影阵营
- usage:
  - 可装备装备 (伤害测试用)

## waxwelljournal
- 燃料: 噩梦燃料类型 720s
- usage:
  - 麦斯威尔专用
  - 每次施法燃料 -36 消耗 (最多 20次)
  - 4种法术: 工人 / 守卫 / 陷阱 / 柱子

## wereitem_beaver
- 类型: 食物
- 堆叠: 10
- 饱食度: 25
- 生命值: -20 (诅咒大师技能时 0)
- 理智: -15 (诅咒大师技能时 0)
- usage:
  - 伍迪专用
  - 技能树联动 (诅咒大师)

## wereitem_goose
- 类型: 食物
- 堆叠: 10
- 饱食度: 25
- 生命值: -20 (诅咒大师技能时 0)
- 理智: -15 (诅咒大师技能时 0)
- usage:
  - 伍迪专用
  - 技能树联动 (诅咒大师)

## wereitem_moose
- 类型: 食物
- 堆叠: 10
- 饱食度: 25
- 生命值: -20 (诅咒大师技能时 0)
- 理智: -15 (诅咒大师技能时 0)
- usage:
  - 伍迪专用
  - 技能树联动 (诅咒大师)

## carpentry_station
- 类型: 建筑
- 技术等级: CARPENTRY=2 (插入刀片时 3)
- 拆解: 锤击 2次

## cartographydesk
- 类型: 建筑
- 技术等级: CARTOGRAPHY=2
- 拆解: 锤击 4次
- 功能: 地图清除

## madscience_lab
- 类型: 建筑
- 技术等级: MADSCIENCE=1
- 拆解: 锤击 4次
- 功能: 万圣节活动药水制作

## researchlab
- 类型: 建筑
- 技术等级: SCIENCE=1, MAGIC=1
- 拆解: 锤击 4次
- 激活半径: 4
- 功能: 衣柜

## researchlab2
- 类型: 建筑
- 技术等级: SCIENCE=2, MAGIC=1
- 拆解: 锤击 4次
- 激活半径: 4
- 功能: 衣柜

## sculptingtable
- 类型: 建筑
- 技术等级: SCULPTING=1 (根据材料动态变化)
- 拆解: 锤击 4次
- 功能: 学习草图

## seafaring_prototyper
- 类型: 建筑
- 技术等级: SEAFARING=2
- 拆解: 锤击 4次

## tacklestation
- 类型: 建筑
- 技术等级: FISHING=1
- 拆解: 锤击 4次
- 功能: 学习钓鱼草图

## turfcraftingstation
- 类型: 建筑
- 技术等级: TURFCRAFTING=2, MASHTURFCRAFTING=2
- 拆解: 锤击 4次

## perdshrine
- 类型: 建筑
- 技术等级: PERDOFFERING=3
- 拆解: 锤击 4次
- 功能: 空置时仅交易激活, 献贡后制作台激活
- 贡品: 浆果丛

## pigshrine
- 类型: 建筑
- 技术等级: PIGOFFERING=3, PERDOFFERING=1
- 拆解: 锤击 4次
- 功能: 空置时仅交易激活, 献贡后制作台激活
- 贡品: 肉

## wargshrine
- 类型: 建筑
- 技术等级: WARGOFFERING=3, PERDOFFERING=1
- 拆解: 锤击 4次
- 功能: 空置时仅交易激活, 献贡后制作台激活
- 贡品: 火把 (燃料消耗降低 20%)

## yot_catcoonshrine
- 类型: 建筑
- 技术等级: CATCOONOFFERING=3, PERDOFFERING=1
- 拆解: 锤击 4次
- 功能: 空置时仅交易激活, 献贡后制作台激活
- 贡品: 鸟羽毛

## yotb_beefaloshrine
- 类型: 建筑
- 技术等级: BEEFOFFERING=3, PERDOFFERING=1
- 拆解: 锤击 4次
- 功能: 空置时仅交易激活, 献贡后制作台激活
- 贡品: 皮弗娄牛毛

## yotc_carratshrine
- 类型: 建筑
- 技术等级: CARRATOFFERING=3, PERDOFFERING=1
- 拆解: 锤击 4次
- 功能: 空置时仅交易激活, 献贡后制作台激活
- 贡品: 胡萝卜 / 种子

## yotd_dragonshrine
- 类型: 建筑
- 技术等级: DRAGONOFFERING=3, PERDOFFERING=1
- 拆解: 锤击 4次
- 功能: 空置时仅交易激活, 献贡后制作台激活
- 贡品: 木炭

## yoth_knightshrine
- 类型: 建筑
- 技术等级: KNIGHTOFFERING=3, PERDOFFERING=1
- 拆解: 锤击 4次
- 功能: 空置时仅交易激活, 献贡后制作台激活
- 贡品: 齿轮 / 断线 / 电气部件

## yotr_rabbitshrine
- 类型: 建筑
- 技术等级: RABBITOFFERING=3, PERDOFFERING=1
- 拆解: 锤击 4次
- 功能: 空置时仅交易激活, 献贡后制作台激活; 兔子节日活动时召唤兔人 9只
- 贡品: 胡萝卜

## yots_snakeshrine
- 类型: 建筑
- 技术等级: WORMOFFERING=3, PERDOFFERING=1
- 拆解: 锤击 4次
- 功能: 空置时仅交易激活, 献贡后制作台激活
- 贡品: 怪物肉

## lightning_rod
- 类型: 建筑
- usage:
  - 锤击 4次
  - 雷电吸收 3充能
  - WX78 电池
  - 充能时发光

## minerhat
- 类型: 帽子
- usage:
  - 燃料 468秒 (洞穴燃料)
  - 防水 0.2
  - 头部发光

## rainometer
- 类型: 建筑
- usage:
  - 锤击 4次
  - 降水概率仪表显示

## bearger_fur
- 类型: 材料
- 堆叠: 10
- 特殊: 无

## beeswax
- 类型: 材料
- 堆叠: 40
- 特殊: 靠近火时融化

## boards
- 类型: 材料
- 堆叠: 10
- 燃料: 180秒
- 修复: HP 50 恢复 (木质)
- 木质食谱 — 仅饼干切割器可食用

## cutstone
- 类型: 材料
- 堆叠: 10
- 修复: HP 50 恢复 (石质)
- 鼹鼠诱饵
- 岩石贡品: 3

## malbatross_feathered_weave
- 类型: 材料
- 堆叠: 20
- 燃料: 15秒

## marblebean
- 类型: 材料
- 堆叠: 40
- 鼹鼠诱饵
- 种下后成长为大理石树苗

## moonrockcrater
- 类型: 材料
- 堆叠: 单个 (不可堆叠)
- 修复: HP 80 恢复 + 工作量 4 恢复 (月岩材质)
- 支持宝石镶嵌

## papyrus
- 类型: 材料
- 堆叠: 40
- 燃料: 15秒
- 猫咪玩具

## refined_dust
- 类型: 材料
- 堆叠: 40
- 元素食谱, 饱食度 +1 (NPC专用)
- 诱饵
- 岩石贡品: 1

## rope
- 类型: 材料
- 堆叠: 20
- 燃料: 45秒
- 猫咪玩具

## transistor
- 类型: 材料
- 堆叠: 10
- 特殊: 无

## waxpaper
- 类型: 材料
- 堆叠: 40
- 燃料: 15秒
- 低燃点

## woodie_boards
- 类型: 材料 (= boards)
- 备注: 伍迪使用露西斧用2个木头制作木板的配方变体

## seafaring_prototyper
- 类型: 制作台
- 提供技术: SEAFARING 等级 2
- 锤击次数: 4次

## boat_grass_item
- 类型: 船套件 (水上放置)
- 放置半径: 3
- 船体生命值: 200
- 修复材料: 干草
- 特殊: 不漏水, 随时间自动劣化 (5)

## boat_item
- 类型: 船套件 (水上放置)
- 放置半径: 4
- 船体生命值: 200
- 最大船体伤害: 70
- 修复材料: 木头

## boatpatch_kelp
- 堆叠: 20
- 修复量: 30
- 修复材料: 海带
- 腐烂时间: 4800秒
- 可食用: 饱食度 28.125, 生命值 -3, 理智 -55

## boatpatch
- 堆叠: 20
- 修复量: 100
- 修复材料: 木头
- 燃料值: 中等燃料 ×2

## oar
- 伤害: 17 (基础攻击力的 50%)
- 耐久度: 500次
- 助力: 0.3
- 最大速度贡献: 2
- 攻击磨损: 25
- 失败磨损: 25
- 燃料类型: 木头 (中等燃料)

## oar_driftwood
- 伤害: 17 (基础攻击力的 50%)
- 耐久度: 400次
- 助力: 0.5
- 最大速度贡献: 3.5
- 攻击磨损: 25
- 失败磨损: 25
- 防水: 有
- 燃料类型: 木头 (中等燃料)

## balloonvest
- 装备槽位: 身体
- 浮力装置: 落水时自动膨胀防止
- 燃料类型: 魔法
- 燃料量: 480秒 (1天)
- 使用:
  - 装备中消耗
  - 被击时膨胀并销毁
  - 防止溺水伤害

## anchor_item
- 类型: 船配件套件
- 阻力: 2
- 最大速度系数: 0.15
- 帆力衰减: 0.8
- 锤击次数: 3次
- 燃料值: 大型燃料

## steeringwheel_item
- 类型: 船配件套件
- 放置间距: 中等
- 锤击次数: 3次
- 燃料值: 大型燃料
- 使用:
  - 可操控船只方向

## boat_rotator_kit
- 类型: 船配件套件
- 放置间距: 窄
- 锤击次数: 3次
- 燃料值: 大型燃料
- 使用:
  - 自动旋转/校正船只方向

## mast_item
- 类型: 船配件套件
- 最大速度贡献: 2.5
- 帆力: 0.6
- 舵旋转阻力: 0.23
- 升级: 可安装甲板照明, 避雷针
- 锤击次数: 3次
- 燃料值: 大型燃料

## mast_malbatross_item
- 类型: 船配件套件
- 最大速度贡献: 4
- 帆力: 1.3
- 舵旋转阻力: 0.23
- 升级: 可安装甲板照明, 避雷针
- 锤击次数: 3次
- 燃料值: 大型燃料

## boat_bumper_kelp_kit
- 类型: 船配件套件 (边缘放置)
- 生命值: 20
- 修复材料: 海带
- 掉落物: 海带 × 最多 2个 (生命值成比例)

## boat_bumper_shell_kit
- 类型: 船配件套件 (边缘放置)
- 生命值: 40
- 修复材料: 贝壳
- 掉落物: 蜗牛龟壳碎片 × 最多 2个 (生命值成比例)

## boat_cannon_kit
- 类型: 船配件套件
- 射程: ~20
- 瞄准角度: ±45°
- 锤击次数: 4次
- 燃料值: 大型燃料
- 使用:
  - 装填炮弹后发射

## cannonball_rock_item
- 堆叠: 20
- 直击伤害: 200
- 范围伤害: 120 (直击的60%)
- 范围半径: 3
- 碰撞半径: 0.5
- 发射速度: 20
- 重力: -40

## ocean_trawler_kit
- 类型: 水上建筑套件
- 放置间距: 中等
- 腐烂率降低: 1/3 (鱼类腐烂速度降低)
- 锤击次数: 3次
- 燃料值: 大型燃料
- 使用:
  - 放入海中随时间收集鱼类/海产
  - 含储物箱

## mastupgrade_lamp_item
- 类型: 桅杆升级物品
- 燃料类型: 火
- 燃料量: 360秒
- 使用:
  - 安装在桅杆上提供夜间照明
  - 燃料耗尽时熄灭

## mastupgrade_lightningrod_item
- 类型: 桅杆升级物品
- 使用:
  - 安装在桅杆上提供雷击防御
  - 充电后维持1个周期, 放电后再充电

## fish_box
- 类型: 建筑 (船上或码头放置)
- 腐烂率降低: 1/3 (鱼类腐烂速度降低)
- 锤击次数: 2次
- 使用:
  - 可保管鱼类
  - 锤击销毁时活鱼放生

## winch
- 类型: 建筑
- 下降速度: 2
- 上升速度 (空载): 1.8
- 上升速度 (载物): 1.1
- 船只阻力持续时间: 1秒
- 锤击次数: 3次
- 使用:
  - 打捞海底沉没物品
  - 在船上打捞沉重物体

## waterpump
- 类型: 建筑
- 射程: 7.5
- 锤击次数: 3次
- 使用:
  - 长时间使用动作
  - 向周围火焰喷水灭火

## boat_magnet_kit
- 类型: 船配件套件
- 配对半径: 24
- 最大距离: 48
- 推进力: 0.6
- 最大速度贡献: 2.5
- 放置间距: 中等
- 锤击次数: 3次
- 燃料值: 大型燃料
- 使用:
  - 与自动航法信标配对自动推进

## boat_magnet_beacon
- 类型: 建筑 (地面/海岸安装)
- 锤击次数: 3次
- 使用:
  - 与自动航法器配对使船只自动驶向信标

## flotationcushion
- 装备槽位: 无 (物品栏持有)
- 使用:
  - 落水时自动浮起

## dock_kit
- 堆叠: 20
- 放置条件: 海岸地块 + 相邻陆地
- 使用:
  - 在海岸创建码头地块
  - 注册到码头连接系统

## dock_woodposts_item
- 堆叠: 20
- 放置间距: 窄
- 锤击次数: 3次
- 掉落物: 木头 × 1
- 使用:
  - 在码头边缘安装装饰/防御用桩

## wagpunk_floor_kit
- 堆叠: 20
- 放置条件: 瓦格斯塔夫竞技场内海洋地块
- 使用:
  - 在竞技场内海洋地块创建特殊地板
  - 特殊事件(瓦格斯塔夫Boss)相关建筑

## chesspiece_anchor_sketch
- 类型: 图纸
- 使用:
  - 可用大理石/石材/月亮玻璃制作锚雕像
  - 共享棋子图纸系统

## beeswax_spray
- 类型: 装备工具
- usage:
  - 使用次数 75
  - 植物蜂蜡涂层 (防枯萎)

## gelblob_storage_kit
- 类型: 建筑
- usage:
  - 锤击 4次
  - 食物 1格腐烂停止

## saddle_shadow
- 类型: 装备
- usage:
  - 耐久度 12
  - 移动速度 ×1.45
  - 吸收 60%
  - 维度防御 15
  - 维度攻击 18
  - 暗影抗性 90%

## shadow_beef_bell
- 类型: 物品
- usage:
  - 皮弗娄牛连接
  - 死亡皮弗娄牛复活 (HP -50% + 理智 -100, 冷却 15天)

## voidcloth_kit
- 类型: 修复套件
- usage:
  - 虚空布材质修复套件

## bundlewrap
- 类型: 消耗品
- 堆叠: 20
- 使用: 创建4格打包
- 燃料: 45秒

## candybag
- 类型: 背包 (身体槽位)
- 槽位: 14
- 特殊: 万圣节物品专用收纳

## chestupgrade_stacksize
- 类型: 箱子升级
- 效果: 安装的箱子允许无限堆叠

## dragonflychest
- 类型: 建筑
- 槽位: 12
- 特殊: 不可焚烧
- 升级: 可
- 锤击: 2次

## fish_box
- 类型: 建筑
- 槽位: 20
- 收纳: 海洋生物专用
- 腐烂: 反向 (-1/3倍速度)
- 锤击: 2次

## giftwrap
- 类型: 消耗品
- 堆叠: 20
- 使用: 创建4格礼物打包
- 燃料: 极少量

## icebox
- 类型: 建筑
- 槽位: 9
- 腐烂: 50% 速度 (保质期2倍)
- 锤击: 2次

## saltbox
- 类型: 建筑
- 槽位: 9
- 腐烂: 25% 速度 (保质期4倍)
- 锤击: 2次

## treasurechest
- 类型: 建筑
- 槽位: 9
- 升级: 可
- 锤击: 2次

## pighouse
- 类型: 建筑
- 锤击次数: 4次
- usage:
  - 生成猪人1只, 重生时间4天
  - 夜晚猪人在屋内时发光 (半径 1, 强度 0.5)
- 可燃性: 是

## rabbithouse
- 类型: 建筑
- 锤击次数: 4次
- usage:
  - 生成兔人1只, 重生时间1天
  - 兔人在夜晚出现 (与猪人相反)
- 可燃性: 是

## scarecrow
- 类型: 建筑
- 锤击次数: 6次
- usage:
  - 驱赶附近乌鸦
  - 可更换角色皮肤
- 可燃性: 是

## punchingbag
- 类型: 建筑
- 锤击次数: 6次
- HP: 10009 (即时恢复)
- usage:
  - 伤害测试用 (最大显示 9999)
  - 可装备头/身体装备
- 可燃性: 是

## fence_electric_item
- 类型: 墙 (放置型)
- 安装时 HP: 1 (吸收所有伤害)
- 锤击次数: 3次
- usage:
  - 最大连接数: 2个, 连接范围: 10
  - 连接时形成电力围栏, 接触的敌人触电
- 锤击掉落物: 瓦格朋克零件, 月亮玻璃

## portabletent_item
- 类型: 物品栏物品 (放置型)
- uses: 10
- usage:
  - 睡眠时: 生命值 +2/tick, 饱食度 -1/tick, 目标体温 40度
  - 可安装/回收 (保留剩余耐久度)
- 可燃性: 是

## houndwhistle
- 类型: 物品栏物品
- uses: 10
- usage:
  - 半径 25 内猎犬/座狼驯化 (月亮阵营除外)
  - 忠诚持续 40秒
  - 最大追随数: 5

## meatrack_hermit_multi
- 类型: 建筑
- 锤击次数: 4次
- 容器: 9格
- usage:
  - 肉/鱼/海带晾干 (普通晾肉架3格的3倍)
  - 盐收集功能
- 可燃性: 是

## archive_resonator_item
- 类型: 物品栏物品 (放置型)
- uses: 10
- usage:
  - 月亮祭坛标记/遗物/帝王蟹探索
  - 半径 4 内发现标记时钻头产出遗物
  - 对远距离目标生成光束指示器

## rope_bridge_kit
- 类型: 物品栏物品
- 堆叠: 10
- usage:
  - 在水面安装桥梁 (最长 6格)
  - 根据长度需要多个套件
- 可燃性: 是

## support_pillar_scaffold
- 类型: 建筑
- 锤击次数: 5次
- usage:
  - 防止地震 (范围 40)
  - 投入材料加固 (等级 0~3: 0/10/20/40个)
  - 加固完成时额外10级缓冲

## support_pillar_dreadstone_scaffold
- 类型: 建筑
- 锤击次数: 5次
- usage:
  - 防止地震 (范围 40)
  - 自动再生 (2天周期)
  - 理智光环: 半径 8 内中等理智降低 (指数衰减)

## moon_device_construction1
- 类型: 建筑 (建设阶段)
- usage:
  - 天体祭坛建设3阶段中第1阶段
  - 3阶段完成后9.5秒召唤天体守护者
  - 建设中暗影陨石出现

## table_winters_feast
- 类型: 建筑
- 锤击次数: 4次
- usage:
  - 可放置节日食物 (1格)
  - 桌子范围 3.5, 节日范围 8
  - 周围角色获得节日增益 (生命值/饱食度/理智恢复)

## nightcaphat
- 类型: 帽子 (物品栏物品)
- usage:
  - 睡眠时理智恢复增加30%
  - 增强睡袋/帐篷/午休小屋睡眠效果

## perdfan
- 类型: 物品栏物品
- uses: 9
- usage:
  - 扇风(普通): 消耗1次, 半径 7 内灭火/烟熏, 目标体温最低 2.5度冷却 (最大 -50度降低)
  - 召唤旋风(引导): 额外消耗2次 (共3次), 剩余3次以上时可用, 持续 2秒
  - 总使用: 仅扇风 9次, 或旋风 3次 + 扇风 0次

## cattoy_mouse
- 类型: 物品栏物品
- usage:
  - 猫咪玩具

## mapscroll
- 类型: 物品栏物品
- usage:
  - 记录制作者的探索地图
  - 可向其他玩家传递地图信息
- 可燃性: 是

## miniboatlantern
- 类型: 物品栏物品 (水面放置)
- fuel: 2880秒 (6天, 魔法燃料类型, 不可再充)
- usage:
  - 水面上自主移动的照明 (半径 1.2, 强度 0.8)
  - 移动速度 0.4
  - 燃料耗尽时气球分离

## floatinglantern
- 类型: 物品栏物品
- fuel: 960秒 (2天, 魔法燃料类型, 不可再充)
- usage:
  - 放置后升入天空的照明
  - 根据燃料4级高度 (12/9/6/2)
  - 雨/月冰雹时燃料消耗加速
  - 飞行中全局小地图图标显示

## redlantern
- 类型: 物品栏物品 (手装备)
- fuel: 5760秒 (12天, 魔法燃料类型, 不可再充)
- usage:
  - 手持照明 (半径 1.2, 强度 0.8, 红色)
  - 下雨时燃料消耗加速25%
- 可燃性: 是

## firecrackers
- 类型: 消耗品
- 堆叠: 40
- usage:
  - 点燃时半径 10 内惊吓可惊吓的生物
  - 爆炸次数: 与堆叠数量成比例

## ticoon_builder
- 类型: 消耗品 (使用后消失)
- usage:
  - 使用时召唤猎犬(导路猫)
  - 猎犬引导至尚未发现的猫宝宝位置

## boards_bunch
- 类型: 物品栏物品
- usage:
  - 木板5个捆 — 建设时材料批量投入用
  - 使用时分离为5个木板

## cutstone_bunch
- 类型: 物品栏物品
- usage:
  - 石材5个捆 — 建设时材料批量投入用
  - 使用时分离为5个石材

## winona_battery_low_item
- 类型: 物品栏物品 (放置型)
- usage:
  - 安装时放置薇诺娜的发电机
  - 化学燃料(硝石)使用, 最大燃料 180秒 (消耗率 0.375 → 实际 1天)
  - 电路范围: 6.6

## winona_battery_high_item
- 类型: 物品栏物品 (放置型)
- usage:
  - 安装时放置薇诺娜的高级发电机
  - 魔法燃料(宝石)使用, 最大燃料 2880秒 (6天)
  - 电路范围: 6.6

## winona_spotlight_item
- 类型: 物品栏物品 (放置型)
- usage:
  - 安装时放置薇诺娜的照明器
  - 光照半径 ~4.3, 最小范围 5.4, 最大范围 24
  - 电力消耗: 运行时 0.5, 待机时 0.05

## handpillow_petals
- 类型: 手装备 (伤害 0)
- usage:
  - 击退强度: 1.0, 硬直: 0.75

## handpillow_kelp
- 类型: 手装备 (伤害 0)
- usage:
  - 击退强度: 1.4, 硬直: 0.60

## handpillow_beefalowool
- 类型: 手装备 (伤害 0)
- usage:
  - 击退强度: 1.8, 硬直: 0.40

## handpillow_steelwool
- 类型: 手装备 (伤害 0)
- usage:
  - 击退强度: 2.2, 硬直: 0.20

## bodypillow_petals
- 类型: 身体装备
- usage:
  - 伤害减免: 10%

## bodypillow_kelp
- 类型: 身体装备
- usage:
  - 伤害减免: 30%

## bodypillow_beefalowool
- 类型: 身体装备
- usage:
  - 伤害减免: 50%

## bodypillow_steelwool
- 类型: 身体装备
- usage:
  - 伤害减免: 70%

## chesspiece_anchor_builder
- 体能重量: 3

## chesspiece_antlion_builder
- 体能重量: 4

## chesspiece_bearger_builder
- 体能重量: 4

## chesspiece_bearger_mutated_builder
- 体能重量: 4

## chesspiece_beefalo_builder
- 体能重量: 3

## chesspiece_beequeen_builder
- 体能重量: 4

## chesspiece_bishop_builder
- 体能重量: 3
- usage: 满月/新月激活 (可召唤暗影主教)

## chesspiece_butterfly_builder
- 体能重量: 3

## chesspiece_carrat_builder
- 体能重量: 3

## chesspiece_catcoon_builder
- 体能重量: 3

## chesspiece_clayhound_builder
- 体能重量: 3

## chesspiece_claywarg_builder
- 体能重量: 3

## chesspiece_crabking_builder
- 体能重量: 4

## chesspiece_daywalker_builder
- 体能重量: 4

## chesspiece_daywalker2_builder
- 体能重量: 4

## chesspiece_deerclops_builder
- 体能重量: 4

## chesspiece_deerclops_mutated_builder
- 体能重量: 4

## chesspiece_dragonfly_builder
- 体能重量: 4

## chesspiece_eyeofterror_builder
- 体能重量: 4

## chesspiece_formal_builder
- 体能重量: 3

## chesspiece_guardianphase3_builder
- 体能重量: 4

## chesspiece_kitcoon_builder
- 体能重量: 3

## chesspiece_klaus_builder
- 体能重量: 4

## chesspiece_knight_builder
- 体能重量: 3
- usage: 满月/新月激活 (可召唤暗影骑士)

## chesspiece_malbatross_builder
- 体能重量: 4

## chesspiece_manrabbit_builder
- 体能重量: 3

## chesspiece_minotaur_builder
- 体能重量: 4

## chesspiece_moon_builder
- 体能重量: 3

## chesspiece_moosegoose_builder
- 体能重量: 4

## chesspiece_muse_builder
- 体能重量: 3

## chesspiece_pawn_builder
- 体能重量: 3

## chesspiece_rook_builder
- 体能重量: 3
- usage: 满月/新月激活 (可召唤暗影战车)

## chesspiece_sharkboi_builder
- 体能重量: 4

## chesspiece_stalker_builder
- 体能重量: 4

## chesspiece_toadstool_builder
- 体能重量: 4

## chesspiece_twinsofterror_builder
- 体能重量: 4

## chesspiece_wagboss_lunar_builder
- 体能重量: 4

## chesspiece_wagboss_robot_builder
- 体能重量: 4

## chesspiece_warg_mutated_builder
- 体能重量: 4

## chesspiece_wormboss_builder
- 体能重量: 4

## chesspiece_yotd_builder
- 体能重量: 3

## chesspiece_yoth_builder
- 体能重量: 3

## chesspiece_yots_builder
- 体能重量: 3

## carnival_gametoken
- 类型: 物品栏物品 (活动货币)
- 堆叠: 1

## carnival_gametoken_multiple
- 类型: 物品栏物品 (活动货币)

## carnival_plaza_kit
- 类型: 建筑 (放置型)
- usage:
  - 乌鸦嘉年华活动中心树

## carnival_popcorn
- 类型: 消耗品
- 堆叠: 40

## carnival_prizebooth_kit
- 类型: 建筑 (放置型)
- 锤击次数: 1次
- usage:
  - 乌鸦嘉年华奖品兑换

## carnival_seedpacket
- 类型: 消耗品
- 堆叠: 40

## carnival_vest_a
- 类型: 身体装备
- dapperness: +0.042/s
- 夏季隔热: 120
- fuel: 2400秒 (5天, 使用燃料类型)

## carnival_vest_b
- 类型: 身体装备
- dapperness: +0.042/s
- 夏季隔热: 240
- fuel: 2400秒 (5天, 使用燃料类型)

## carnival_vest_c
- 类型: 身体装备
- dapperness: +0.042/s
- 夏季隔热: 240
- fuel: 2400秒 (5天, 使用燃料类型)

## carnivalcannon_confetti_kit
- 类型: 建筑 (放置型, 活动装饰)
- 锤击次数: 1次

## carnivalcannon_sparkle_kit
- 类型: 建筑 (放置型, 活动装饰)
- 锤击次数: 1次

## carnivalcannon_streamer_kit
- 类型: 建筑 (放置型, 活动装饰)
- 锤击次数: 1次

## carnivaldecor_banner_kit
- 类型: 建筑 (放置型, 活动装饰)
- 锤击次数: 1次

## carnivaldecor_eggride1_kit
- 类型: 建筑 (放置型, 活动游乐设施)
- 锤击次数: 1次
- usage:
  - 激活时间: 30秒, 代币时间: 2400秒

## carnivaldecor_eggride2_kit
- 类型: 建筑 (放置型, 活动游乐设施)
- 锤击次数: 1次

## carnivaldecor_eggride3_kit
- 类型: 建筑 (放置型, 活动游乐设施)
- 锤击次数: 1次

## carnivaldecor_eggride4_kit
- 类型: 建筑 (放置型, 活动游乐设施)
- 锤击次数: 1次

## carnivaldecor_figure_kit
- 类型: 建筑 (放置型, 活动装饰)
- 锤击次数: 1次

## carnivaldecor_figure_kit_season2
- 类型: 建筑 (放置型, 活动装饰)
- 锤击次数: 1次

## carnivaldecor_lamp_kit
- 类型: 建筑 (放置型, 活动照明)
- 锤击次数: 1次
- usage:
  - 激活时间: 60秒, 代币时间: 480秒

## carnivaldecor_plant_kit
- 类型: 建筑 (放置型, 活动装饰)
- 锤击次数: 1次

## carnivalfood_corntea
- 类型: 消耗品
- 堆叠: 40
- 饱食度: 9.375
- 生命值: 0
- 理智: +5
- 温度: -40, 15秒 (冷却饮料)
- 保质期: 1440秒 (3天)

## carnivalgame_feedchicks_kit
- 类型: 建筑 (放置型, 活动游戏)
- 锤击次数: 1次

## carnivalgame_herding_kit
- 类型: 建筑 (放置型, 活动游戏)
- 锤击次数: 1次

## carnivalgame_memory_kit
- 类型: 建筑 (放置型, 活动游戏)
- 锤击次数: 1次

## carnivalgame_puckdrop_kit
- 类型: 建筑 (放置型, 活动游戏)
- 锤击次数: 1次

## carnivalgame_shooting_kit
- 类型: 建筑 (放置型, 活动游戏)
- 锤击次数: 1次

## carnivalgame_wheelspin_kit
- 类型: 建筑 (放置型, 活动游戏)
- 锤击次数: 1次

## wintercooking_berrysauce
- 类型: 冬季盛宴食物

## wintercooking_bibingka
- 类型: 冬季盛宴食物

## wintercooking_cabbagerolls
- 类型: 冬季盛宴食物

## wintercooking_festivefish
- 类型: 冬季盛宴食物

## wintercooking_gravy
- 类型: 冬季盛宴食物

## wintercooking_latkes
- 类型: 冬季盛宴食物

## wintercooking_lutefisk
- 类型: 冬季盛宴食物

## wintercooking_mulleddrink
- 类型: 冬季盛宴食物

## wintercooking_panettone
- 类型: 冬季盛宴食物

## wintercooking_pavlova
- 类型: 冬季盛宴食物

## wintercooking_pickledherring
- 类型: 冬季盛宴食物

## wintercooking_polishcookie
- 类型: 冬季盛宴食物

## wintercooking_pumpkinpie
- 类型: 冬季盛宴食物

## wintercooking_roastturkey
- 类型: 冬季盛宴食物

## wintercooking_stuffing
- 类型: 冬季盛宴食物

## wintercooking_sweetpotato
- 类型: 冬季盛宴食物

## wintercooking_tamales
- 类型: 冬季盛宴食物

## wintercooking_tourtiere
- 类型: 冬季盛宴食物

## halloween_experiment_bravery
- 类型: 消耗品 (活动)

## halloween_experiment_health
- 类型: 消耗品 (活动)

## halloween_experiment_moon
- 类型: 消耗品 (活动)

## halloween_experiment_root
- 类型: 消耗品 (活动)

## halloween_experiment_sanity
- 类型: 消耗品 (活动)

## halloween_experiment_volatile
- 类型: 消耗品 (活动)

## yotb_pattern_fragment_1
- 类型: 物品栏物品 (制作材料)

## yotb_pattern_fragment_2
- 类型: 物品栏物品 (制作材料)

## yotb_pattern_fragment_3
- 类型: 物品栏物品 (制作材料)

## yotb_post_item
- 类型: 建筑 (放置型, 活动)
- 锤击次数: 4次

## yotb_sewingmachine_item
- 类型: 建筑 (放置型, 活动)
- 锤击次数: 4次
- usage:
  - 皮弗娄牛服装制作容器

## yotb_stage_item
- 类型: 建筑 (放置型, 活动)
- 锤击次数: 4次
- usage:
  - 皮弗娄牛选美大赛评审用

## yotc_carrat_gym_direction_item
- 类型: 建筑 (放置型, 活动)
- usage: 胡萝卜鼠方向感训练

## yotc_carrat_gym_reaction_item
- 类型: 建筑 (放置型, 活动)
- usage: 胡萝卜鼠反应速度训练

## yotc_carrat_gym_speed_item
- 类型: 建筑 (放置型, 活动)
- usage: 胡萝卜鼠速度训练

## yotc_carrat_gym_stamina_item
- 类型: 建筑 (放置型, 活动)
- usage: 胡萝卜鼠体力训练

## yotc_carrat_race_checkpoint_item
- 类型: 建筑 (放置型, 活动)
- usage: 胡萝卜鼠赛跑检查点

## yotc_carrat_race_finish_item
- 类型: 建筑 (放置型, 活动)
- usage: 胡萝卜鼠赛跑终点线

## yotc_carrat_race_start_item
- 类型: 建筑 (放置型, 活动)
- usage: 胡萝卜鼠赛跑起点

## yotc_carrat_scale_item
- 类型: 建筑 (放置型, 活动)
- usage: 胡萝卜鼠能力值测量

## yotc_seedpacket
- 类型: 消耗品 (活动)

## yotc_seedpacket_rare
- 类型: 消耗品 (活动)

## yotc_shrinecarrat
- 类型: 建筑 (活动)

## dragonboat_kit
- 类型: 物品栏物品 (放置型)
- usage:
  - 龙船放置: HP 200, 半径 3.0

## dragonboat_pack
- 类型: 物品栏物品 (放置型)
- usage:
  - 含装备的龙船批量放置

## dragonheadhat
- 类型: 帽子 (头部装备)
- fuel: 480秒 (1天, 使用燃料类型, 仅舞蹈动作中消耗)
- usage:
  - 龙舞3人组的头部部分
  - 3人组完成时 dapperness 最大 +0.069/s

## dragonbodyhat
- 类型: 帽子 (头部装备)
- fuel: 480秒 (1天, 使用燃料类型, 仅舞蹈动作中消耗)
- usage:
  - 龙舞3人组的身体部分

## dragontailhat
- 类型: 帽子 (头部装备)
- fuel: 480秒 (1天, 使用燃料类型, 仅舞蹈动作中消耗)
- usage:
  - 龙舞3人组的尾部部分

## mast_yotd_item
- 类型: 物品栏物品 (放置型)
- usage: 龙船专用帆安装

## mastupgrade_lamp_item_yotd
- 类型: 物品栏物品 (放置型)
- usage: 龙船帆照明升级

## boat_bumper_yotd_kit
- 类型: 物品栏物品 (放置型)
- usage: 龙船专用缓冲器

## boatrace_checkpoint_throwable_deploykit
- 类型: 物品栏物品 (投掷放置型)
- usage: 龙船竞赛检查点安装

## boatrace_seastack_throwable_deploykit
- 类型: 物品栏物品 (投掷放置型)
- usage: 龙船竞赛浮标安装

## boatrace_start_throwable_deploykit
- 类型: 物品栏物品 (投掷放置型)
- usage: 龙船竞赛起跑塔安装

## yotd_anchor_item
- 类型: 物品栏物品 (放置型)
- usage: 龙船专用锚

## yotd_boatpatch_proxy
- 类型: 物品栏物品
- usage: 龙船修复用

## yotd_oar
- 类型: 物品栏物品 (手装备)
- usage: 龙船专用桨

## yotd_steeringwheel_item
- 类型: 物品栏物品 (放置型)
- usage: 龙船专用舵

## yoth_chair_rocking_item
- 类型: 物品栏物品 (放置型)
- usage: 摇马建筑安装 (可坐)

## yoth_knightstick
- 类型: 手装备
- damage: 17
- fuel: 2880秒 (6天, 使用燃料类型, 行走中消耗)
- speed_mult: 1.15~1.60 (疾跑时加速)
- usage:
  - 疾跑时饱食度消耗率增加33%
  - 最大疾跑次数: 30

## yotp_food1
- 类型: 消耗品
- 堆叠: 40
- 生命值: +12
- 饱食度: 150
- 理智: +5
- 保质期: 7200秒 (15天)

## yotp_food2
- 类型: 消耗品
- 堆叠: 40
- 生命值: 0
- 饱食度: 150
- 理智: 0
- 保质期: 无

## yotp_food3
- 类型: 消耗品
- 堆叠: 40
- 生命值: +6
- 饱食度: 75
- 理智: +1
- 保质期: 7200秒 (15天)

## yotr_decor_1_item
- 类型: 建筑 (放置型)
- 锤击次数: 4次
- usage: 活动装饰照明

## yotr_decor_2_item
- 类型: 建筑 (放置型)
- 锤击次数: 4次
- usage: 活动装饰照明

## yotr_fightring_kit
- 类型: 建筑 (放置型)
- 锤击次数: 4次
- usage:
  - 枕头大战迷你游戏激活
  - 最大奖品: 10个

## yotr_food1
- 类型: 消耗品
- 堆叠: 40
- 生命值: +15
- 饱食度: 75
- 理智: +8.25
- 保质期: 7200秒 (15天)

## yotr_food2
- 类型: 消耗品
- 堆叠: 40
- 生命值: +60
- 饱食度: 18.75
- 理智: +8.25
- 保质期: 7200秒 (15天)

## yotr_food3
- 类型: 消耗品
- 堆叠: 40
- 生命值: +15
- 饱食度: 18.75
- 理智: +33
- 保质期: 7200秒 (15天)

## yotr_food4
- 类型: 消耗品
- 堆叠: 40
- 生命值: +30
- 饱食度: 37.5
- 理智: +16.5
- 保质期: 7200秒 (15天)

## yotr_token
- 类型: 物品栏物品 (活动代币)
- usage: 枕头大战挑战用

## yots_lantern_post_item
- 类型: 建筑 (放置型)
- usage:
  - 活动路灯 — 最大燃料 960秒 (2天)

## hermitcrab_lightpost
- 类型: 建筑
- usage: 隐士岛路灯

## hermitcrab_relocation_kit
- 类型: 物品栏物品
- usage: 隐士蟹的家搬迁用

## hermitcrab_teashop
- 类型: 建筑
- usage: 珍珠的茶馆建设

## hermithotspring_constr
- 类型: 建筑 (建设)
- usage: 隐士岛温泉建设

## hermithouse_ornament
- 类型: 物品栏物品
- usage: 隐士之家装饰

## hermitshop_chum
- 类型: 购买物品

## hermitshop_chum_blueprint
- 类型: 购买物品 (蓝图)

## hermitshop_hermit_bundle_shells
- 类型: 购买物品

## hermitshop_oceanfishingbobber_canary
- 类型: 购买物品 (钓鱼浮标)

## hermitshop_oceanfishingbobber_crow
- 类型: 购买物品 (钓鱼浮标)

## hermitshop_oceanfishingbobber_goose
- 类型: 购买物品 (钓鱼浮标)

## hermitshop_oceanfishingbobber_malbatross
- 类型: 购买物品 (钓鱼浮标)

## hermitshop_oceanfishingbobber_robin
- 类型: 购买物品 (钓鱼浮标)

## hermitshop_oceanfishingbobber_robin_winter
- 类型: 购买物品 (钓鱼浮标)

## hermitshop_oceanfishinglure_hermit_drowsy
- 类型: 购买物品 (钓鱼饵)

## hermitshop_oceanfishinglure_hermit_heavy
- 类型: 购买物品 (钓鱼饵)

## hermitshop_oceanfishinglure_hermit_rain
- 类型: 购买物品 (钓鱼饵)

## hermitshop_oceanfishinglure_hermit_snow
- 类型: 购买物品 (钓鱼饵)

## hermitshop_supertacklecontainer
- 类型: 购买物品 (钓鱼工具箱)

## hermitshop_tacklecontainer
- 类型: 购买物品 (钓鱼工具箱)

## hermitshop_turf_shellbeach_blueprint
- 类型: 购买物品 (蓝图)

## hermitshop_winch_blueprint
- 类型: 购买物品 (蓝图)

## hermitshop_winter_ornament_boss_hermithouse
- 类型: 购买物品 (冬季装饰)

## hermitshop_winter_ornament_boss_pearl
- 类型: 购买物品 (冬季装饰)

## shellweaver
- 类型: 建筑 (制作台)
- 锤击次数: 3次
- usage:
  - 解锁贝壳编织者科技等级 1/2
  - 烹饪功能 (6秒)

## shellweaver_desiccant
- 类型: 物品栏物品

## shellweaver_desiccantboosted
- 类型: 物品栏物品

## shellweaver_hermitcrab_shell
- 类型: 物品栏物品

## shellweaver_icestaff2
- 类型: 物品栏物品 (武器)

## shellweaver_icestaff3
- 类型: 物品栏物品 (武器)

## shellweaver_messagebottleempty
- 类型: 物品栏物品

## shellweaver_nonslipgrit
- 类型: 物品栏物品

## shellweaver_nonslipgritboosted
- 类型: 物品栏物品

## shellweaver_salty_doghat
- 类型: 帽子 (头部装备)

## wanderingtradershop_bluegem
- 类型: 购买物品

## wanderingtradershop_cutgrass
- 类型: 购买物品

## wanderingtradershop_cutreeds
- 类型: 购买物品

## wanderingtradershop_flint
- 类型: 购买物品

## wanderingtradershop_gears
- 类型: 购买物品

## wanderingtradershop_livinglog
- 类型: 购买物品

## wanderingtradershop_moonglass
- 类型: 购买物品

## wanderingtradershop_pigskin
- 类型: 购买物品

## wanderingtradershop_redgem
- 类型: 购买物品

## wanderingtradershop_twigs
- 类型: 购买物品

## rabbitkingshop_armor_carrotlure
- 类型: 购买物品 (身体装备)

## rabbitkingshop_hat_rabbit
- 类型: 购买物品 (帽子)

## rabbitkingshop_rabbitkinghorn
- 类型: 购买物品

## wagboss_robot_constructionsite_kit
- 类型: 物品栏物品 (放置型)
- usage: W.A.R.B.O.T. 建设基地安装

## wagboss_robot_creation_parts
- 类型: 物品栏物品 (建设材料)
- usage: W.A.R.B.O.T. 建设所需零件

## wagpunk_workstation_blueprint_moon_device_construction1
- 类型: 购买物品 (蓝图)
- usage: 在瓦格朋克工作站解锁未完成实验制作配方

## wagpunk_workstation_blueprint_moonstorm_goggleshat
- 类型: 购买物品 (蓝图)
- usage: 在瓦格朋克工作站解锁太空护目镜制作配方

## wagpunk_workstation_moonstorm_static_catcher
- 类型: 物品栏物品
- usage: 月风暴活动相关装备

## wagpunk_workstation_security_pulse_cage
- 类型: 物品栏物品
- usage: 月风暴活动相关装备

## kitcoon_nametag
- 类型: 物品栏物品 (一次性)
- usage:
  - 给猫宝宝命名 (使用后消失)

## kitcoondecor1_kit
- 类型: 建筑 (放置型)
- 锤击次数: 4次
- usage:
  - 猫宝宝玩具 — 猫宝宝玩耍
- 可燃性: 是

## kitcoondecor2_kit
- 类型: 建筑 (放置型)
- 锤击次数: 4次
- usage:
  - 猫宝宝玩具 — 猫宝宝玩耍
- 可燃性: 是

## kitcoonden_kit
- 类型: 建筑 (放置型)
- 锤击次数: 4次
- usage:
  - 猫宝宝育儿所 — 捉迷藏迷你游戏 (猫宝宝3只以上, 60秒限制, 半径 30)
- 可燃性: 是

## coldfire
- 类型: 建筑
- usage:
  - 燃料 270秒
  - 化学燃料
  - 下雨时燃料消耗加速 (最大降水时 3.5倍消耗)
  - 冷却火焰

## coldfirepit
- 类型: 建筑
- usage:
  - 锤击 4次
  - 燃料 360秒
  - 化学燃料
  - 燃料加成倍率 2倍

## firesuppressor
- 类型: 建筑
- usage:
  - 锤击 4次
  - 燃料 2400秒 (5天)
  - 探测范围 15
  - 自动灭火
  - 冷却

## siestahut
- 类型: 建筑
- usage:
  - 锤击 4次
  - 使用次数 15
  - 白天专用睡眠
  - 冷却模式
  - HP +2/秒, 饱食度 -0.33/秒

## plantregistryhat
- 类型: 帽子
- usage:
  - 植物信息查看
  - 夏季隔热 60
  - 永久使用
  - 无防水

## turf_dragonfly
- 类型: 地板材料
- 堆叠: 20
- usage:
  - 阻止火灾蔓延

## axe
- damage: 27.2
- uses: 100

## goldenaxe
- damage: 27.2
- uses: 100 (工作消耗 1/4 = 实际 400次砍伐, 攻击消耗也为 1/4)

## pickaxe
- uses: 33

## goldenpickaxe
- uses: 33 (工作消耗 1/4 = 实际 132次采矿)

## shovel
- uses: 25

## goldenshovel
- uses: 25 (工作消耗 1/4 = 实际 100次)

## hammer
- damage: 17
- uses: 75
- usage:
  - 拆解建筑 (回收50%材料)

## pitchfork
- damage: 17
- uses: 25 (工作消耗 0.125/次 = 实际 200次地板作业)

## goldenpitchfork
- damage: 17
- uses: 25 (工作消耗 0.03125/次 = 实际 800次地板作业)

## razor
- uses: 无限
- usage:
  - 皮弗娄牛/胡须剃毛用

## farm_hoe
- damage: 17
- uses: 25

## golden_farm_hoe
- damage: 17
- uses: 25 (工作消耗 1/4 = 实际 100次)

## moonglassaxe
- damage: 34
- uses: 100 (砍伐效率 2.5倍, 砍伐消耗 1.25/次 = 实际 80次砍伐, 攻击消耗 2/次 = 实际 50次攻击)
- usage:
  - 暗影敌人额外伤害25% (42.5)
  - 暗影敌人攻击时耐久消耗减半

## multitool_axe_pickaxe
- damage: 42.5
- uses: 800 (工作效率 4/3倍)
- usage:
  - 斧头 + 镐兼用
  - 暗影等级 1

## pickaxe_lunarplant
- damage: 32.5
- planar_damage: 10
- uses: 600 (采矿效率 4/3倍)
- usage:
  - 暗影敌人额外伤害10%
  - `[套装]` 亮茄套装加成时伤害增加10% + 维度伤害 +5
  - `[修复]` 月亮植物修复套件修复 (耐久度 100% 恢复)

## shovel_lunarplant
- damage: 17.2
- planar_damage: 10
- uses: 250
- usage:
  - 铲子 + 锄头兼用
  - 暗影敌人额外伤害10%
  - `[套装]` 亮茄套装加成时伤害增加10% + 维度伤害 +5
  - `[修复]` 月亮植物修复套件修复 (耐久度 100% 恢复)

## voidcloth_scythe
- damage: 38
- planar_damage: 18
- uses: 200
- dapperness: -0.0347/秒 (每分钟 -2.08)
- usage:
  - 范围收割 (半径 4, 角度 165度)
  - 装备时理智持续降低 (每分钟 -2.08)
  - 月亮阵营额外伤害10%
  - 暗影等级 3
  - `[套装]` 虚空布套装加成时伤害增加10% (41.8) + 维度伤害 +5
  - `[修复]` 虚空布修复套件修复 (耐久度 100% 恢复)
  - 会说话 (有台词)

## cane
- damage: 17
- speed_mult: 1.25 (移动速度提升25%)

## walking_stick
- speed_mult: 1.15 (移动速度提升15%)
- perish_time: 1920 (4天)
- usage:
  - 随时间腐烂

## bugnet
- damage: 4.25
- uses: 10 (捕获 1/次, 攻击 3/次)

## thulecitebugnet
- damage: 4.25
- uses: 100 (捕获 1/次, 攻击 3/次)

## birdtrap
- uses: 8

## trap
- uses: 8

## fishingrod
- damage: 4.25
- uses: 9 (钓鱼 1/次, 攻击 4/次)

## oceanfishingrod
- usage:
  - 海洋钓鱼专用 (可装备饵/钓具)

## brush
- damage: 27.2
- uses: 75 (刷毛 1/次, 攻击 3/次)
- usage:
  - 皮弗娄牛刷毛用 (驯化相关)

## compass
- damage: 10
- fuel_time: 1920 (4天)
- usage:
  - 方向显示
  - 攻击时耐久度降低30%

## pocket_scale
- usage:
  - 鱼类重量测量

## featherpencil
- 堆叠: 20
- usage:
  - 地图标记用

## sentryward
- usage:
  - 安装时公开小地图区域

## sewing_kit
- uses: 5
- usage:
  - 服装/护甲耐久度修复 (修复量 2400)

## sewing_tape
- 堆叠: 40
- usage:
  - 服装/护甲耐久度修复 (修复量 2400)

## reskin_tool
- usage:
  - 物品皮肤更换

## wagpunkbits_kit
- 堆叠: 10
- usage:
  - `[修复]` W.A.R.B.I.S.装备专用修复套件 (耐久度 100% 恢复)

## wateringcan
- uses: 40 (装水后)
- usage:
  - 农作物浇水 (水量 25)
  - 灭火 + 温度 -5

## premiumwateringcan
- uses: 160 (装水后)
- usage:
  - 农作物浇水 (水量 25)
  - 升级喷壶 (4倍耐久度)

## miniflare
- usage:
  - 使用时15秒光源 + 小地图显示 (半径 30)

## megaflare
- usage:
  - 使用时光源 + 敌对生物引诱 (独眼巨鹿 60%, 海盗 60%, 海象 60% 概率)

## beef_bell
- usage:
  - 皮弗娄牛驯化/召唤用

## saddlehorn
- damage: 17
- uses: 10 (鞍具卸除 1/次, 攻击 3/次)
- usage:
  - 皮弗娄牛鞍具卸除用

## balloons_empty
- usage:
  - `[角色]` 韦斯专用
  - 气球制作材料

## gestalt_cage
- damage: 17
- usage:
  - `[角色]` 温蒂专用
  - 捕获灵体(格式塔)

## pocketwatch_dismantler
- usage:
  - `[角色]` 旺达专用
  - 怀表分解

## slingshotmodkit
- usage:
  - `[角色]` 沃尔特专用
  - 弹弓模块安装/更换

## spider_repellent
- uses: 10
- usage:
  - `[角色]` 韦伯专用
  - 蜘蛛驱逐 (半径 8, 蜘蛛女王无视)

## spider_whistle
- uses: 40次 (2.5%/次消耗)
- usage:
  - `[角色]` 韦伯专用
  - 半径 16 内蜘蛛巢召唤蜘蛛 + 唤醒沉睡蜘蛛

## spiderden_bedazzler
- uses: 20
- usage:
  - `[角色]` 韦伯专用
  - 蜘蛛巢装饰处理 (装饰后蜘蛛巢蛛丝半径缩小: 9→4)

## wortox_nabbag
- damage: 13.6~34
- uses: 200 (捕虫: 20次)
- usage:
  - `[角色]` 沃拓克斯专用
  - 小型生物捕获 + 武器兼用
  - 可作为捕虫网使用 (20次限制)

## winona_remote
- fuel_time: 480 (1天)
- usage:
  - `[角色]` 薇诺娜专用
  - 远程控制薇诺娜机器 (射程 30)

## wx78_scanner_item
- uses: 无限
- usage:
  - `[角色]` WX-78专用
  - 物品栏持有时半径内可扫描生物自动探测提醒
  - 放在地上 → 半径 7 内生物扫描 (10秒, 史诗 20秒) → 获得相应模块配方
  - WX-78必须在半径 7 以内才能维持扫描

## wx78_moduleremover
- uses: 无限
- usage:
  - `[角色]` WX-78专用
  - 移除已装备模块1个 (从最上方开始)
  - 移除活动模块时扣除充电量

## antlionhat
- (参照 armor.md)

## fence_rotator
- (参照 weapons.md)

## spear
- damage: 34
- uses: 150

## spear_wathgrithr
- damage: 42.5
- uses: 200
- usage:
  - `[角色]` 女武神专用

## spear_wathgrithr_lightning
- damage: 59.5
- uses: 150
- usage:
  - `[角色]` 女武神专用
  - `[电击]` 湿敌 1.5倍
  - 冲刺攻击 (冷却 3秒, 冲刺伤害 68)
  - 用抑制静电升级 → 转化为充能雷电枪

## spear_wathgrithr_lightning_charged
- damage: 59.5
- planar_damage: 20
- uses: 200
- speed_mult: 1.2 (移动速度 +20%)
- usage:
  - `[角色]` 升级后的女武神才能装备
  - `[电击]` 湿敌 1.5倍
  - 冲刺攻击 (冷却 1.5秒, 冲刺伤害 68)
  - 冲刺命中时耐久度修复 4 (每次冲刺最多 2次 = 最多修复 8)

## hambat
- damage: 59.5 (随新鲜度降至50%)
- uses: 100
- usage:
  - 随时间伤害降低 (最低 50% = 29.75)

## batbat
- damage: 42.5
- uses: 75
- usage:
  - 命中时生命值 +6.8 恢复, 理智 -3.4 降低
  - 暗影等级 2

## nightsword
- damage: 68
- uses: 100
- dapperness: -0.2083/秒 (每分钟 -12.5, 每天 -100)
- usage:
  - 装备时理智持续降低 (每分钟 -12.5)
  - 暗影等级 2

## glasscutter
- damage: 68
- uses: 75
- usage:
  - 暗影敌人伤害 ×1.25 (68→85)
  - 暗影敌人命中时耐久消耗减半

## ruins_bat
- damage: 59.5
- uses: 200
- speed_mult: 1.1 (移动速度 +10%)
- usage:
  - 暗影等级 2

## sword_lunarplant
- damage: 38
- planar_damage: 30
- uses: 200
- usage:
  - `[修复]` 月亮植物修复套件修复 (耐久度 100% 恢复)

## shadow_battleaxe
- damage: 38
- uses: 200
- usage:
  - 击杀时饱食度 +50 获取
  - 可砍伐 (斧头兼用)
  - 暗影等级 3
  - 击杀数对应4阶段升级 (0/3/6/9击杀):
  - 等级维持需饱食度消耗 (Lv2: 0.05/秒, Lv3: 0.1/秒, Lv4: 0.2/秒)
  - 吸血时理智降低 (吸血量×0.5)

## voidcloth_boomerang
- damage: 5~27.2 (距离成比例)
- planar_damage: 5~27.2 (相同缩放)
- uses: 85
- speed_mult: 1.1
- usage:
  - `[远程]` 攻击射程 10 (最大命中 14), 飞行中体积·伤害递增
  - 月亮阵营额外伤害 25% 增加 (34)
  - 暗影等级 3

## staff_lunarplant
- planar_damage: 10
- uses: 50
- usage:
  - `[远程]` 投射物弹射敌人5次
  - 暗影敌人额外伤害 ×2
  - `[套装]` 亮茄套装加成时弹射 7次
  - `[修复]` 月亮植物修复套件修复 (耐久度 100% 恢复)

## trident
- damage: 51
- uses: 200
- usage:
  - 目标在海上时伤害增加50% (76.5)
  - 特殊技能: 范围伤害 85, 半径 2.75, 召唤间歇泉 10个 (50次使用)

## whip
- damage: 27.2
- uses: 175
- usage:
  - 射程 +2 (比近战更远)
  - 超级鞭击: 普通怪 25%, 怪物 20%, Boss 5% 概率硬直
  - 超级鞭击射程 14

## fence_rotator
- damage: 34
- uses: 200
- usage:
  - 围栏旋转/移动可用

## nightstick
- damage: 28.9
- usage:
  - `[电击]` 电击伤害 (湿敌 1.5倍 → 实际 43.4)
  - 燃料基础耐久度 (1440秒)
  - 光源功能

## pocketwatch_weapon
- damage: 81.6 / 耗尽时 27.2
- usage:
  - `[角色]` 旺达专用
  - 时间燃料基础耐久度
  - 燃料耗尽时伤害大幅降低

## boomerang
- damage: 27.2
- uses: 10
- usage:
  - `[远程]` 射程 12
  - 回飞时接住失败则自伤

## slingshot
- usage:
  - `[角色]` 沃尔特专用
  - `[远程]` 攻击射程 10 (最大命中 14)
  - 根据弹药伤害变化:
  - `[技能树]` 蓄力时伤害 ×2, 速度 ×1.25, 射程增加, 弹药 30% 概率不消耗

## blowdart_pipe
- 堆叠: 20
- damage: 100
- uses: 1
- usage:
  - `[远程]` `[消耗品]` 一次性

## blowdart_fire
- 堆叠: 20
- damage: 100
- uses: 1
- usage:
  - `[远程]` `[消耗品]` 一次性
  - 点燃目标

## blowdart_sleep
- 堆叠: 20
- uses: 1
- usage:
  - `[远程]` `[消耗品]` 一次性
  - 使目标入睡

## blowdart_yellow
- 堆叠: 20
- damage: 60
- uses: 1
- usage:
  - `[远程]` `[消耗品]` 一次性
  - `[电击]` 电击伤害 (湿敌 1.5倍)

## houndstooth_blowpipe
- damage: 34
- planar_damage: 34
- usage:
  - `[远程]` 攻击射程 12 (最大命中 16)
  - 暗影敌人额外伤害 ×1.1

## firestaff
- uses: 20
- usage:
  - `[远程]` 点燃目标

## icestaff
- uses: 20
- usage:
  - `[远程]` 冰冻目标

## staff_tornado
- uses: 15
- usage:
  - `[远程]` 召唤龙卷风 (移动中范围伤害)

## panflute
- uses: 10
- usage:
  - 使周围生物入睡 (半径 15, 持续 20秒)

## gunpowder
- 堆叠: 40
- damage: 200
- usage:
  - `[放置型]` `[消耗品]` 放置后点燃时范围爆炸 (半径 3)

## bomb_lunarplant
- 堆叠: 20
- planar_damage: 200
- usage:
  - `[远程]` `[消耗品]` 投掷时范围维度爆炸 (半径 3)
  - 6个一组制作

## beemine
- usage:
  - `[放置型]` `[消耗品]` 放置后敌人接近时召唤蜜蜂4只 (半径 3)

## sleepbomb
- 堆叠: 20
- usage:
  - `[远程]` `[消耗品]` 投掷时使周围生物入睡 (20秒)

## waterballoon
- 堆叠: 20
- usage:
  - `[远程]` `[消耗品]` 投掷时灭火 + 湿度 +20
  - 温度 -5 降低

## trap_teeth
- damage: 60
- uses: 10
- usage:
  - `[放置型]` 放置型陷阱 (半径 1.5)

## trap_bramble
- damage: 40
- uses: 10
- usage:
  - `[放置型]` 放置型陷阱 (半径 2.5)
  - `[角色]` 沃姆伍德专用

## boat_cannon_kit
- usage:
  - 安装在船上的大炮 (使用炮弹)

## cannonball_rock_item
- 堆叠: 20
- damage: 200
- usage:
  - `[远程]` 大炮弹药
  - 溅射伤害 120, 溅射半径 3

## winona_catapult
- damage: 42.5
- usage:
  - `[角色]` 薇诺娜专用建筑
  - `[放置型]` 自动攻击 (攻击周期 2.5秒)
  - 范围伤害 (半径 1.25)
  - 电力消耗

## winona_catapult_item
- usage:
  - 薇诺娜的投石机安装套件

## wortox_nabbag
- damage: 13.6~34
- uses: 200 (捕虫用途: 20次)
- usage:
  - `[角色]` 沃拓克斯专用
  - 小型生物捕获 + 武器兼用
  - 可作为捕虫网使用 (20次限制)

## wathgrithr_shield
- armor_hp: 420 (150×4×0.7)
- absorption: 0.85
- damage: 51 (34×1.5)
- usage:
  - `[角色]` 女武神专用
  - 可格挡 (范围 178度, 持续 1秒)
  - 格挡成功时冷却减少 70%
  - 冷却 10秒 (装备时 2秒)
  - 格挡时护甲耐久消耗 3
  - `[技能树]` 格挡额外伤害强化 (15~30, 持续 5秒, 缩放 0.5)
  - `[技能树]` 格挡持续时间 ×2.5

## campfire
- 类型: 建筑
- usage:
  - 燃料 270秒 (初始 135)
  - 下雨时燃料消耗加速 (最大降水时 3.5倍消耗)
  - 4阶段
  - 可烹饪
  - 耗尽时灰烬 + 消失

## firepit
- 类型: 建筑
- usage:
  - 锤击 4次
  - 燃料 360秒
  - 下雨时燃料消耗加速 (最大降水时 3倍消耗)
  - 燃料加成倍率 2倍
  - 可烹饪

## dragonflyfurnace
- 类型: 建筑
- usage:
  - 锤击 6次
  - 永久火焰
  - 发热 115
  - 4格容器
  - 可烹饪 + 焚烧

## tent
- 类型: 建筑
- usage:
  - 锤击 4次
  - 使用次数 15
  - 睡眠 HP +2/秒, 饱食度 -1/秒
  - 体温目标 40

## heatrock
- 类型: 物品
- usage:
  - 耐久度 8次 (温度范围转换时消耗)
  - 5级温度
  - 保温 120秒
  - 最高温度时发光

## winterometer
- 类型: 建筑
- usage:
  - 锤击 4次
  - 温度仪表显示

## cotl_tabernacle_level1
- 类型: 建筑
- usage:
  - 锤击 4次
  - 3阶段升级
  - Lv1 燃料 120 / Lv2 燃料 240 / Lv3 燃料 480
  - 可烹饪
  - 理智光环 (Lv1 +50 / Lv2 +80 / Lv3 +200天)
