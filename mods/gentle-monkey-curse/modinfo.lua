name = "Gentle Monkey Curse"
description = [[Makes the cursed monkey token less annoying.
- Tokens no longer chase and force themselves into your inventory
- You can freely drop tokens from your inventory
- Tokens can be stored in backpacks

원숭이 저주 토큰의 불쾌한 메커니즘을 완화합니다.
- 토큰이 플레이어를 추적하지 않습니다
- 인벤토리에서 자유롭게 버릴 수 있습니다
- 백팩에도 넣을 수 있습니다]]

author = "dst-craft"
version = "1.0.0"

api_version = 10
dst_compatible = true
dont_starve_compatible = false
reign_of_giants_compatible = false

all_clients_require_mod = false
client_only_mod = false
server_filter_tags = {"gentle_monkey_curse"}

icon_atlas = "modicon.xml"
icon = "modicon.tex"

configuration_options = {
    {
        name = "disable_tracking",
        label = "Disable Tracking / 추적 비활성화",
        hover = "Tokens won't chase players / 토큰이 플레이어를 추적하지 않습니다",
        options = {
            {description = "On", data = true},
            {description = "Off", data = false},
        },
        default = true,
    },
    {
        name = "allow_drop",
        label = "Allow Drop / 버리기 허용",
        hover = "Tokens can be dropped from inventory / 인벤토리에서 토큰을 버릴 수 있습니다",
        options = {
            {description = "On", data = true},
            {description = "Off", data = false},
        },
        default = true,
    },
    {
        name = "disable_force_insert",
        label = "Disable Force Insert / 강제 삽입 차단",
        hover = "Tokens won't force into inventory / 토큰이 인벤토리에 강제로 들어오지 않습니다",
        options = {
            {description = "On", data = true},
            {description = "Off", data = false},
        },
        default = true,
    },
}
