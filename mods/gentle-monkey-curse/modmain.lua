--[[
    Gentle Monkey Curse
    Makes cursed monkey tokens less annoying by:
    1. Disabling auto-tracking toward players
    2. Blocking forced inventory insertion
    3. Allowing players to drop tokens freely
]]

local disable_tracking = GetModConfigData("disable_tracking")
local allow_drop = GetModConfigData("allow_drop")
local disable_force_insert = GetModConfigData("disable_force_insert")

----------------------------------------------------------------------
-- 1) Disable tracking: tokens stay on the ground where they drop
----------------------------------------------------------------------
if disable_tracking then
    AddComponentPostInit("curseditem", function(self)
        -- Kill the periodic player-search task
        if self.inst.findplayertask then
            self.inst.findplayertask:Cancel()
            self.inst.findplayertask = nil
        end

        -- Neutralize tracking and re-attach logic
        self.lookforplayer = function() end
        self.OnUpdate = function() end

        -- Stop the component update loop
        self.inst:StopUpdatingComponent(self)
    end)
end

----------------------------------------------------------------------
-- 2) Block forced inventory insertion (safety net)
----------------------------------------------------------------------
if disable_force_insert then
    AddComponentPostInit("cursable", function(self)
        local _OrigForceOntoOwner = self.ForceOntoOwner
        self.ForceOntoOwner = function(self_inner, item)
            -- Only block monkey tokens; let other cursed items through
            if item and item.prefab == "cursed_monkey_token" then
                return
            end
            if _OrigForceOntoOwner then
                return _OrigForceOntoOwner(self_inner, item)
            end
        end
    end)
end

----------------------------------------------------------------------
-- 3) Allow dropping: remove nosteal, pocket-only, and re-attach lock
----------------------------------------------------------------------
if allow_drop then
    AddPrefabPostInit("cursed_monkey_token", function(inst)
        if not TheWorld.ismastersim then return end

        -- Remove the tag that prevents dropping/stealing
        inst:RemoveTag("nosteal")

        -- Allow storage in backpacks (not just main inventory)
        if inst.components.inventoryitem then
            inst.components.inventoryitem.canonlygoinpocket = false
        end

        -- Disable the "snap back to owner" check
        if inst.components.curseditem then
            inst.components.curseditem.CheckForOwner = function() end
        end
    end)
end
