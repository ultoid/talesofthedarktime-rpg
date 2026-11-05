/**
 * NUSV Database Studio - Central Reactive State Store
 */

const State = {
    currentTab: 'actors',
    pictures: [],
    faces: [],
    characters: [],
    svActors: [],
    enemiesPics: [],
    animationImages: [],
    actors: [],
    classes: [],
    races: [],
    weapons: [],
    armors: [],
    skills: [],
    items: [],
    enemies: [],
    troops: [],
    states: [],
    animations: [],
    system: {},
    pluginParameters: {},
    selectedIndex: 1,
    selectedIndices: {
        actors: 1,
        classes: 1,
        races: 1,
        weapons: 1,
        armors: 1,
        skills: 1,
        animations: 1,
        items: 1,
        enemies: 1,
        states: 1
    },
    hasUnsavedChanges: false,
    classPreviewLevel: 1,
    actorSimBaseLevel: 1,
    actorSimClassLevel: 1,
    armorSlotFilter: 'all',
    weaponTypeFilter: 'all',
    classTierFilter: 'all',
    raceGroupFilter: 'all',
    skillClassFilter: 'player_skills',
    itemCategoryFilter: 'all',
    stateCategoryFilter: 'all'
};

// Standard definitions


function getActiveItem() {
    const items = getActiveList();
    return items[State.selectedIndex] || null;
}



function getActiveList() {
    switch (State.currentTab) {
        case 'actors': return State.actors;
        case 'classes': return State.classes;
        case 'races': return State.races;
        case 'weapons': return State.weapons;
        case 'armors': return State.armors;
        case 'skills': return State.skills;
        case 'skill_animator': return State.skills;
        case 'items': return State.items;
        case 'enemies': return State.enemies;
        case 'states': return State.states;
        case 'animations': return State.animations;
        default: return [];
    }
}



function setUnsaved(status) {
    State.hasUnsavedChanges = status;
    if (status) {
        if (!State.modifiedTabs) State.modifiedTabs = new Set();
        if (State.currentTab) State.modifiedTabs.add(State.currentTab);
    } else {
        if (State.modifiedTabs) State.modifiedTabs.clear();
    }
    const badge = document.getElementById('unsavedBadge');
    if (badge) {
        badge.style.display = status ? 'inline-block' : 'none';
    }
}
