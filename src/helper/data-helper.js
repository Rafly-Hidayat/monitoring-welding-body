const cycleAsset = ['X700', 'X702', 'X740', 'X742', 'X751', 'X7A8', 'X7AA', 'X0211', 'X0251', 'X0221', 'X0261', 'X0271', 'X0281', 'X0291', 'X02A1', 'X02B1', 'X02C1', 'X02D1', 'X0212', 'X0252', 'X0222', 'X0262', 'X0272', 'X0282', 'X0292', 'X02A2', 'X02B2', 'X02C2', 'X02D2', 'X0213', 'X0253', 'X0223', 'X0263', 'X0273', 'X0283', 'X0293', 'X02A3', 'X02B3', 'X02C3', 'X02D3', 'X0214', 'X0254', 'X0224', 'X0264', 'X0274', 'X0284', 'X0294', 'X02A4', 'X02B4', 'X02C4', 'X02D4', 'X0215', 'X0255', 'X0225', 'X0265', 'X0275', 'X0285', 'X0295', 'X02A5', 'X02B5', 'X02C5', 'X02D5', 'X0216', 'X0256', 'X0226', 'X0266', 'X0276', 'X0286', 'X0296', 'X02A6', 'X02B6', 'X02C6', 'X02D6']

const spConditionAsset = ['X700', 'X701', 'X702', 'X703', 'X740', 'X741', 'X742', 'X743', 'X750', 'X751', 'X752', 'X7A8', 'X7A9', 'X7AA', 'X7AB', 'X7B1', 'X7B2']
const ohcConditionAsset = [
    'X0201', 'X0211', 'X0221', 'X0231', 'X0241', 'X0251', 'X0261', 'X0271', 'X0281', 'X0291', 'X02A1', 'X02B1', 'X02C1', 'X02D1', 'X02E1',
    'X0202', 'X0212', 'X0222', 'X0232', 'X0242', 'X0252', 'X0262', 'X0272', 'X0282', 'X0292', 'X02A2', 'X02B2', 'X02C2', 'X02D2', 'X02E2',
    'X0203', 'X0213', 'X0223', 'X0233', 'X0243', 'X0253', 'X0263', 'X0273', 'X0283', 'X0293', 'X02A3', 'X02B3', 'X02C3', 'X02D3', 'X02E3',
    'X0204', 'X0214', 'X0224', 'X0234', 'X0244', 'X0254', 'X0264', 'X0274', 'X0284', 'X0294', 'X02A4', 'X02B4', 'X02C4', 'X02D4', 'X02E4',
    'X0205', 'X0215', 'X0225', 'X0235', 'X0245', 'X0255', 'X0265', 'X0275', 'X0285', 'X0295', 'X02A5', 'X02B5', 'X02C5', 'X02D5', 'X02E5',
    'X0206', 'X0216', 'X0226', 'X0236', 'X0246', 'X0256', 'X0266', 'X0276', 'X0286', 'X0296', 'X02A6', 'X02B6', 'X02C6', 'X02D6', 'X02E6',
]

const sensorCycleMapping = {
    // SP1
    'X700': {
        cycleName: 'SP 1',
        descriptionName: 'STOPPER',
        condition: { from: "0", to: "1" }
    },
    'X702': {
        cycleName: 'SP 1',
        descriptionName: 'POSITIONER',
        condition: { from: "0", to: "1" }
    },

    // SP7
    'X740': {
        cycleName: 'SP 7',
        descriptionName: 'STOPPER',
        condition: { from: "0", to: "1" }
    },
    'X742': {
        cycleName: 'SP 7',
        descriptionName: 'POSITIONER',
        condition: { from: "0", to: "1" }
    },
    'X751': {
        cycleName: 'SP 7',
        descriptionName: 'Pusher',
        condition: { from: "0", to: "1" }
    },

    // SP8
    'X7A8': {
        cycleName: 'SP 8',
        descriptionName: 'STOPPER',
        condition: { from: "0", to: "1" }
    },
    'X7AA': {
        cycleName: 'SP 8',
        descriptionName: 'POSITIONER',
        condition: { from: "0", to: "1" }
    },

    // OHC1
    'X0211': {
        cycleName: 'OHC 1',
        descriptionName: 'Lift Up',
        condition: { from: "0", to: "1" }
    },
    'X0251': {
        cycleName: 'OHC 1',
        descriptionName: 'Lift Down',
        condition: { from: "1", to: "0" }
    },
    'X0221': {
        cycleName: 'OHC 1',
        descriptionName: 'Collision',
        condition: { from: "0", to: "1" }
    },
    'X0261': {
        cycleName: 'OHC 1',
        descriptionName: 'Hanger L Close',
        condition: { from: "1", to: "0" }
    },
    'X0271': {
        cycleName: 'OHC 1',
        descriptionName: 'Hanger L Open',
        condition: { from: "0", to: "1" }
    },
    'X0281': {
        cycleName: 'OHC 1',
        descriptionName: 'Hanger R Close',
        condition: { from: "1", to: "0" }
    },
    'X0291': {
        cycleName: 'OHC 1',
        descriptionName: 'Hanger R Open',
        condition: { from: "0", to: "1" }
    },
    'X02A1': {
        cycleName: 'OHC 1',
        descriptionName: 'Chain Fault FL',
        condition: { from: "0", to: "1" }
    },
    'X02B1': {
        cycleName: 'OHC 1',
        descriptionName: 'Chain Fault FR',
        condition: { from: "0", to: "1" }
    },
    'X02C1': {
        cycleName: 'OHC 1',
        descriptionName: 'Chain Fault RL',
        condition: { from: "0", to: "1" }
    },
    'X02D1': {
        cycleName: 'OHC 1',
        descriptionName: 'Chain Fault RR',
        condition: { from: "0", to: "1" }
    },

    // OHC2
    'X0212': {
        cycleName: 'OHC 2',
        descriptionName: 'Lift Up',
        condition: { from: "0", to: "1" }
    },
    'X0252': {
        cycleName: 'OHC 2',
        descriptionName: 'Lift Down',
        condition: { from: "1", to: "0" }
    },
    'X0222': {
        cycleName: 'OHC 2',
        descriptionName: 'Collision',
        condition: { from: "0", to: "1" }
    },
    'X0262': {
        cycleName: 'OHC 2',
        descriptionName: 'Hanger L Close',
        condition: { from: "1", to: "0" }
    },
    'X0272': {
        cycleName: 'OHC 2',
        descriptionName: 'Hanger L Open',
        condition: { from: "0", to: "1" }
    },
    'X0282': {
        cycleName: 'OHC 2',
        descriptionName: 'Hanger R Close',
        condition: { from: "1", to: "0" }
    },
    'X0292': {
        cycleName: 'OHC 2',
        descriptionName: 'Hanger R Open',
        condition: { from: "0", to: "1" }
    },
    'X02A2': {
        cycleName: 'OHC 2',
        descriptionName: 'Chain Fault FL',
        condition: { from: "0", to: "1" }
    },
    'X02B2': {
        cycleName: 'OHC 2',
        descriptionName: 'Chain Fault FR',
        condition: { from: "0", to: "1" }
    },
    'X02C2': {
        cycleName: 'OHC 2',
        descriptionName: 'Chain Fault RL',
        condition: { from: "0", to: "1" }
    },
    'X02D2': {
        cycleName: 'OHC 2',
        descriptionName: 'Chain Fault RR',
        condition: { from: "0", to: "1" }
    },

    // OHC3
    'X0213': {
        cycleName: 'OHC 3',
        descriptionName: 'Lift Up',
        condition: { from: "0", to: "1" }
    },
    'X0253': {
        cycleName: 'OHC 3',
        descriptionName: 'Lift Down',
        condition: { from: "1", to: "0" }
    },
    'X0223': {
        cycleName: 'OHC 3',
        descriptionName: 'Collision',
        condition: { from: "0", to: "1" }
    },
    'X0263': {
        cycleName: 'OHC 3',
        descriptionName: 'Hanger L Close',
        condition: { from: "1", to: "0" }
    },
    'X0273': {
        cycleName: 'OHC 3',
        descriptionName: 'Hanger L Open',
        condition: { from: "0", to: "1" }
    },
    'X0283': {
        cycleName: 'OHC 3',
        descriptionName: 'Hanger R Close',
        condition: { from: "1", to: "0" }
    },
    'X0293': {
        cycleName: 'OHC 3',
        descriptionName: 'Hanger R Open',
        condition: { from: "0", to: "1" }
    },
    'X02A3': {
        cycleName: 'OHC 3',
        descriptionName: 'Chain Fault FL',
        condition: { from: "0", to: "1" }
    },
    'X02B3': {
        cycleName: 'OHC 3',
        descriptionName: 'Chain Fault FR',
        condition: { from: "0", to: "1" }
    },
    'X02C3': {
        cycleName: 'OHC 3',
        descriptionName: 'Chain Fault RL',
        condition: { from: "0", to: "1" }
    },
    'X02D3': {
        cycleName: 'OHC 3',
        descriptionName: 'Chain Fault RR',
        condition: { from: "0", to: "1" }
    },

    // OHC4
    'X0214': {
        cycleName: 'OHC 4',
        descriptionName: 'Lift Up',
        condition: { from: "0", to: "1" }
    },
    'X0254': {
        cycleName: 'OHC 4',
        descriptionName: 'Lift Down',
        condition: { from: "1", to: "0" }
    },
    'X0224': {
        cycleName: 'OHC 4',
        descriptionName: 'Collision',
        condition: { from: "0", to: "1" }
    },
    'X0264': {
        cycleName: 'OHC 4',
        descriptionName: 'Hanger L Close',
        condition: { from: "1", to: "0" }
    },
    'X0274': {
        cycleName: 'OHC 4',
        descriptionName: 'Hanger L Open',
        condition: { from: "0", to: "1" }
    },
    'X0284': {
        cycleName: 'OHC 4',
        descriptionName: 'Hanger R Close',
        condition: { from: "1", to: "0" }
    },
    'X0294': {
        cycleName: 'OHC 4',
        descriptionName: 'Hanger R Open',
        condition: { from: "0", to: "1" }
    },
    'X02A4': {
        cycleName: 'OHC 4',
        descriptionName: 'Chain Fault FL',
        condition: { from: "0", to: "1" }
    },
    'X02B4': {
        cycleName: 'OHC 4',
        descriptionName: 'Chain Fault FR',
        condition: { from: "0", to: "1" }
    },
    'X02C4': {
        cycleName: 'OHC 4',
        descriptionName: 'Chain Fault RL',
        condition: { from: "0", to: "1" }
    },
    'X02D4': {
        cycleName: 'OHC 4',
        descriptionName: 'Chain Fault RR',
        condition: { from: "0", to: "1" }
    },

    // OHC5
    'X0215': {
        cycleName: 'OHC 5',
        descriptionName: 'Lift Up',
        condition: { from: "0", to: "1" }
    },
    'X0255': {
        cycleName: 'OHC 5',
        descriptionName: 'Lift Down',
        condition: { from: "1", to: "0" }
    },
    'X0225': {
        cycleName: 'OHC 5',
        descriptionName: 'Collision',
        condition: { from: "0", to: "1" }
    },
    'X0265': {
        cycleName: 'OHC 5',
        descriptionName: 'Hanger L Close',
        condition: { from: "1", to: "0" }
    },
    'X0275': {
        cycleName: 'OHC 5',
        descriptionName: 'Hanger L Open',
        condition: { from: "0", to: "1" }
    },
    'X0285': {
        cycleName: 'OHC 5',
        descriptionName: 'Hanger R Close',
        condition: { from: "1", to: "0" }
    },
    'X0295': {
        cycleName: 'OHC 5',
        descriptionName: 'Hanger R Open',
        condition: { from: "0", to: "1" }
    },
    'X02A5': {
        cycleName: 'OHC 5',
        descriptionName: 'Chain Fault FL',
        condition: { from: "0", to: "1" }
    },
    'X02B5': {
        cycleName: 'OHC 5',
        descriptionName: 'Chain Fault FR',
        condition: { from: "0", to: "1" }
    },
    'X02C5': {
        cycleName: 'OHC 5',
        descriptionName: 'Chain Fault RL',
        condition: { from: "0", to: "1" }
    },
    'X02D5': {
        cycleName: 'OHC 5',
        descriptionName: 'Chain Fault RR',
        condition: { from: "0", to: "1" }
    },

    // OHC6
    'X0216': {
        cycleName: 'OHC 6',
        descriptionName: 'Lift Up',
        condition: { from: "0", to: "1" }
    },
    'X0256': {
        cycleName: 'OHC 6',
        descriptionName: 'Lift Down',
        condition: { from: "1", to: "0" }
    },
    'X0226': {
        cycleName: 'OHC 6',
        descriptionName: 'Collision',
        condition: { from: "0", to: "1" }
    },
    'X0266': {
        cycleName: 'OHC 6',
        descriptionName: 'Hanger L Close',
        condition: { from: "1", to: "0" }
    },
    'X0276': {
        cycleName: 'OHC 6',
        descriptionName: 'Hanger L Open',
        condition: { from: "0", to: "1" }
    },
    'X0286': {
        cycleName: 'OHC 6',
        descriptionName: 'Hanger R Close',
        condition: { from: "1", to: "0" }
    },
    'X0296': {
        cycleName: 'OHC 6',
        descriptionName: 'Hanger R Open',
        condition: { from: "0", to: "1" }
    },
    'X02A6': {
        cycleName: 'OHC 6',
        descriptionName: 'Chain Fault FL',
        condition: { from: "0", to: "1" }
    },
    'X02B6': {
        cycleName: 'OHC 6',
        descriptionName: 'Chain Fault FR',
        condition: { from: "0", to: "1" }
    },
    'X02C6': {
        cycleName: 'OHC 6',
        descriptionName: 'Chain Fault RL',
        condition: { from: "0", to: "1" }
    },
    'X02D6': {
        cycleName: 'OHC 6',
        descriptionName: 'Chain Fault RR',
        condition: { from: "0", to: "1" }
    },
}

const sensorConditionMapping = {
    // SP1
    "X700": {
        conditionName: "SP 1",
        descriptionName: "STOPPER-1 Open END",
        condition: { from: "0", to: "1" }
    },
    "X701": {
        conditionName: "SP 1",
        descriptionName: "STOPPER-1 Close END",
        condition: { from: "0", to: "1" }
    },
    "X702": {
        conditionName: "SP 1",
        descriptionName: "POSITIONER-1 forward END",
        condition: { from: "0", to: "1" }
    },
    "X703": {
        conditionName: "SP 1",
        descriptionName: "POSITIONER-1 reverse END",
        condition: { from: "0", to: "1" }
    },

    // SP7
    "X740": {
        conditionName: "SP 7",
        descriptionName: "STOPPER-2 Open END",
        condition: { from: "0", to: "1" }
    },
    "X741": {
        conditionName: "SP 7",
        descriptionName: "STOPPER-2 Close END",
        condition: { from: "0", to: "1" }
    },
    "X742": {
        conditionName: "SP 7",
        descriptionName: "POSITIONER-2 forward END",
        condition: { from: "0", to: "1" }
    },
    "X743": {
        conditionName: "SP 7",
        descriptionName: "POSITIONER-2 reverse END",
        condition: { from: "0", to: "1" }
    },
    "X750": {
        conditionName: "SP 7",
        descriptionName: "LS Doly Present",
        condition: { from: "0", to: "1" }
    },
    "X751": {
        conditionName: "SP 7",
        descriptionName: "LS Pusher forward END",
        condition: { from: "0", to: "1" }
    },
    "X752": {
        conditionName: "SP 7",
        descriptionName: "LS Unpush reverse END",
        condition: { from: "0", to: "1" }
    },

    // SP8
    "X7A8": {
        conditionName: "SP 8",
        descriptionName: "STOPPER-3 Open END",
        condition: { from: "0", to: "1" }
    },
    "X7A9": {
        conditionName: "SP 8",
        descriptionName: "STOPPER-3 Close END",
        condition: { from: "0", to: "1" }
    },
    "X7AA": {
        conditionName: "SP 8",
        descriptionName: "POSITIONER-3 forward END",
        condition: { from: "0", to: "1" }
    },
    "X7AB": {
        conditionName: "SP 8",
        descriptionName: "POSITIONER-3 reverse END",
        condition: { from: "0", to: "1" }
    },
    "X7B1": {
        conditionName: "SP 8",
        descriptionName: "Unloading Down End LH",
        condition: { from: "0", to: "1" }
    },
    "X7B2": {
        conditionName: "SP 8",
        descriptionName: "Unloading Down End RH",
        condition: { from: "0", to: "1" }
    },

    // OHC1
    "X0201": {
        conditionName: "OHC 1",
        descriptionName: "Spare",
        condition: { from: "0", to: "1" }
    },
    "X0211": {
        conditionName: "OHC 1",
        descriptionName: "LIFT_UP_END1",
        condition: { from: "0", to: "1" }
    },
    "X0221": {
        conditionName: "OHC 1",
        descriptionName: "COLLISION",
        condition: { from: "0", to: "1" }
    },
    "X0231": {
        conditionName: "OHC 1",
        descriptionName: "LIFT_UP_OVERRUN",
        condition: { from: "0", to: "1" }
    },
    "X0241": {
        conditionName: "OHC 1",
        descriptionName: "LIFT_UP_END 2",
        condition: { from: "0", to: "1" }
    },
    "X0251": {
        conditionName: "OHC 1",
        descriptionName: "LIFT_DOWN_OVERRUN",
        condition: { from: "1", to: "0" }
    },
    "X0261": {
        conditionName: "OHC 1",
        descriptionName: "HANGER_ARM_L_OPEN_END",
        condition: { from: "1", to: "0" }
    },
    "X0271": {
        conditionName: "OHC 1",
        descriptionName: "HANGER_ARM_L_CLOSED_END",
        condition: { from: "0", to: "1" }
    },
    "X0281": {
        conditionName: "OHC 1",
        descriptionName: "HANGER_ARM_R_OPEN_END",
        condition: { from: "1", to: "0" }
    },
    "X0291": {
        conditionName: "OHC 1",
        descriptionName: "HANGER_ARM_R_CLOSED_END",
        condition: { from: "0", to: "1" }
    },
    "X02A1": {
        conditionName: "OHC 1",
        descriptionName: "LIFT_CHAIN_FAULT_FL",
        condition: { from: "0", to: "1" }
    },
    "X02B1": {
        conditionName: "OHC 1",
        descriptionName: "LIFT_CHAIN_FAULT_FR",
        condition: { from: "0", to: "1" }
    },
    "X02C1": {
        conditionName: "OHC 1",
        descriptionName: "LIFT_CHAIN_FAULT_RL",
        condition: { from: "0", to: "1" }
    },
    "X02D1": {
        conditionName: "OHC 1",
        descriptionName: "LIFT_CHAIN_FAULT_RR",
        condition: { from: "0", to: "1" }
    },
    "X02E1": {
        conditionName: "OHC 1",
        descriptionName: "spare",
        condition: { from: "0", to: "1" }
    },
    "X02F1": {
        conditionName: "OHC 1",
        descriptionName: "spare",
        condition: { from: "0", to: "1" }
    },

    // OHC2
    "X0202": {
        conditionName: "OHC 2",
        descriptionName: "Spare",
        condition: { from: "0", to: "1" }
    },
    "X0212": {
        conditionName: "OHC 2",
        descriptionName: "LIFT_UP_END2",
        condition: { from: "0", to: "1" }
    },
    "X0222": {
        conditionName: "OHC 2",
        descriptionName: "COLLISION",
        condition: { from: "0", to: "1" }
    },
    "X0232": {
        conditionName: "OHC 2",
        descriptionName: "LIFT_UP_OVERRUN",
        condition: { from: "0", to: "1" }
    },
    "X0242": {
        conditionName: "OHC 2",
        descriptionName: "LIFT_UP_END 3",
        condition: { from: "0", to: "1" }
    },
    "X0252": {
        conditionName: "OHC 2",
        descriptionName: "LIFT_DOWN_OVERRUN",
        condition: { from: "1", to: "0" }
    },
    "X0262": {
        conditionName: "OHC 2",
        descriptionName: "HANGER_ARM_L_OPEN_END",
        condition: { from: "1", to: "0" }
    },
    "X0272": {
        conditionName: "OHC 2",
        descriptionName: "HANGER_ARM_L_CLOSED_END",
        condition: { from: "0", to: "1" }
    },
    "X0282": {
        conditionName: "OHC 2",
        descriptionName: "HANGER_ARM_R_OPEN_END",
        condition: { from: "1", to: "0" }
    },
    "X0292": {
        conditionName: "OHC 2",
        descriptionName: "HANGER_ARM_R_CLOSED_END",
        condition: { from: "0", to: "1" }
    },
    "X02A2": {
        conditionName: "OHC 2",
        descriptionName: "LIFT_CHAIN_FAULT_FL",
        condition: { from: "0", to: "1" }
    },
    "X02B2": {
        conditionName: "OHC 2",
        descriptionName: "LIFT_CHAIN_FAULT_FR",
        condition: { from: "0", to: "1" }
    },
    "X02C2": {
        conditionName: "OHC 2",
        descriptionName: "LIFT_CHAIN_FAULT_RL",
        condition: { from: "0", to: "1" }
    },
    "X02D2": {
        conditionName: "OHC 2",
        descriptionName: "LIFT_CHAIN_FAULT_RR",
        condition: { from: "0", to: "1" }
    },
    "X02E2": {
        conditionName: "OHC 2",
        descriptionName: "spare",
        condition: { from: "0", to: "1" }
    },
    "X02F2": {
        conditionName: "OHC 2",
        descriptionName: "spare",
        condition: { from: "0", to: "1" }
    },

    // OHC3
    "X0203": {
        conditionName: "OHC 3",
        descriptionName: "Spare",
        condition: { from: "0", to: "1" }
    },
    "X0213": {
        conditionName: "OHC 3",
        descriptionName: "LIFT_UP_END2",
        condition: { from: "0", to: "1" }
    },
    "X0223": {
        conditionName: "OHC 3",
        descriptionName: "COLLISION",
        condition: { from: "0", to: "1" }
    },
    "X0233": {
        conditionName: "OHC 3",
        descriptionName: "LIFT_UP_OVERRUN",
        condition: { from: "0", to: "1" }
    },
    "X0243": {
        conditionName: "OHC 3",
        descriptionName: "LIFT_UP_END 3",
        condition: { from: "0", to: "1" }
    },
    "X0253": {
        conditionName: "OHC 3",
        descriptionName: "LIFT_DOWN_OVERRUN",
        condition: { from: "1", to: "0" }
    },
    "X0263": {
        conditionName: "OHC 3",
        descriptionName: "HANGER_ARM_L_OPEN_END",
        condition: { from: "1", to: "0" }
    },
    "X0273": {
        conditionName: "OHC 3",
        descriptionName: "HANGER_ARM_L_CLOSED_END",
        condition: { from: "0", to: "1" }
    },
    "X0283": {
        conditionName: "OHC 3",
        descriptionName: "HANGER_ARM_R_OPEN_END",
        condition: { from: "1", to: "0" }
    },
    "X0293": {
        conditionName: "OHC 3",
        descriptionName: "HANGER_ARM_R_CLOSED_END",
        condition: { from: "0", to: "1" }
    },
    "X02A3": {
        conditionName: "OHC 3",
        descriptionName: "LIFT_CHAIN_FAULT_FL",
        condition: { from: "0", to: "1" }
    },
    "X02B3": {
        conditionName: "OHC 3",
        descriptionName: "LIFT_CHAIN_FAULT_FR",
        condition: { from: "0", to: "1" }
    },
    "X02C3": {
        conditionName: "OHC 3",
        descriptionName: "LIFT_CHAIN_FAULT_RL",
        condition: { from: "0", to: "1" }
    },
    "X02D3": {
        conditionName: "OHC 3",
        descriptionName: "LIFT_CHAIN_FAULT_RR",
        condition: { from: "0", to: "1" }
    },
    "X02E3": {
        conditionName: "OHC 3",
        descriptionName: "spare",
        condition: { from: "0", to: "1" }
    },
    "X02F3": {
        conditionName: "OHC 3",
        descriptionName: "spare",
        condition: { from: "0", to: "1" }
    },

    // OHC4
    "X0204": {
        conditionName: "OHC 4",
        descriptionName: "Spare",
        condition: { from: "0", to: "1" }
    },
    "X0214": {
        conditionName: "OHC 4",
        descriptionName: "LIFT_UP_END3",
        condition: { from: "0", to: "1" }
    },
    "X0224": {
        conditionName: "OHC 4",
        descriptionName: "COLLISION",
        condition: { from: "0", to: "1" }
    },
    "X0234": {
        conditionName: "OHC 4",
        descriptionName: "LIFT_UP_OVERRUN",
        condition: { from: "0", to: "1" }
    },
    "X0244": {
        conditionName: "OHC 4",
        descriptionName: "LIFT_UP_END 4",
        condition: { from: "0", to: "1" }
    },
    "X0254": {
        conditionName: "OHC 4",
        descriptionName: "LIFT_DOWN_OVERRUN",
        condition: { from: "1", to: "0" }
    },
    "X0264": {
        conditionName: "OHC 4",
        descriptionName: "HANGER_ARM_L_OPEN_END",
        condition: { from: "1", to: "0" }
    },
    "X0274": {
        conditionName: "OHC 4",
        descriptionName: "HANGER_ARM_L_CLOSED_END",
        condition: { from: "0", to: "1" }
    },
    "X0284": {
        conditionName: "OHC 4",
        descriptionName: "HANGER_ARM_R_OPEN_END",
        condition: { from: "1", to: "0" }
    },
    "X0294": {
        conditionName: "OHC 4",
        descriptionName: "HANGER_ARM_R_CLOSED_END",
        condition: { from: "0", to: "1" }
    },
    "X02A4": {
        conditionName: "OHC 4",
        descriptionName: "LIFT_CHAIN_FAULT_FL",
        condition: { from: "0", to: "1" }
    },
    "X02B4": {
        conditionName: "OHC 4",
        descriptionName: "LIFT_CHAIN_FAULT_FR",
        condition: { from: "0", to: "1" }
    },
    "X02C4": {
        conditionName: "OHC 4",
        descriptionName: "LIFT_CHAIN_FAULT_RL",
        condition: { from: "0", to: "1" }
    },
    "X02D4": {
        conditionName: "OHC 4",
        descriptionName: "LIFT_CHAIN_FAULT_RR",
        condition: { from: "0", to: "1" }
    },
    "X02E4": {
        conditionName: "OHC 4",
        descriptionName: "spare",
        condition: { from: "0", to: "1" }
    },
    "X02F4": {
        conditionName: "OHC 4",
        descriptionName: "spare",
        condition: { from: "0", to: "1" }
    },

    // OHC5
    "X0205": {
        conditionName: "OHC 5",
        descriptionName: "Spare",
        condition: { from: "0", to: "1" }
    },
    "X0215": {
        conditionName: "OHC 5",
        descriptionName: "LIFT_UP_END3",
        condition: { from: "0", to: "1" }
    },
    "X0225": {
        conditionName: "OHC 5",
        descriptionName: "COLLISION",
        condition: { from: "0", to: "1" }
    },
    "X0235": {
        conditionName: "OHC 5",
        descriptionName: "LIFT_UP_OVERRUN",
        condition: { from: "0", to: "1" }
    },
    "X0245": {
        conditionName: "OHC 5",
        descriptionName: "LIFT_UP_END 4",
        condition: { from: "0", to: "1" }
    },
    "X0255": {
        conditionName: "OHC 5",
        descriptionName: "LIFT_DOWN_OVERRUN",
        condition: { from: "1", to: "0" }
    },
    "X0265": {
        conditionName: "OHC 5",
        descriptionName: "HANGER_ARM_L_OPEN_END",
        condition: { from: "1", to: "0" }
    },
    "X0275": {
        conditionName: "OHC 5",
        descriptionName: "HANGER_ARM_L_CLOSED_END",
        condition: { from: "0", to: "1" }
    },
    "X0285": {
        conditionName: "OHC 5",
        descriptionName: "HANGER_ARM_R_OPEN_END",
        condition: { from: "1", to: "0" }
    },
    "X0295": {
        conditionName: "OHC 5",
        descriptionName: "HANGER_ARM_R_CLOSED_END",
        condition: { from: "0", to: "1" }
    },
    "X02A5": {
        conditionName: "OHC 5",
        descriptionName: "LIFT_CHAIN_FAULT_FL",
        condition: { from: "0", to: "1" }
    },
    "X02B5": {
        conditionName: "OHC 5",
        descriptionName: "LIFT_CHAIN_FAULT_FR",
        condition: { from: "0", to: "1" }
    },
    "X02C5": {
        conditionName: "OHC 5",
        descriptionName: "LIFT_CHAIN_FAULT_RL",
        condition: { from: "0", to: "1" }
    },
    "X02D5": {
        conditionName: "OHC 5",
        descriptionName: "LIFT_CHAIN_FAULT_RR",
        condition: { from: "0", to: "1" }
    },
    "X02E5": {
        conditionName: "OHC 5",
        descriptionName: "spare",
        condition: { from: "0", to: "1" }
    },
    "X02F5": {
        conditionName: "OHC 5",
        descriptionName: "spare",
        condition: { from: "0", to: "1" }
    },

    // OHC6
    "X0206": {
        conditionName: "OHC 6",
        descriptionName: "Spare",
        condition: { from: "0", to: "1" }
    },
    "X0216": {
        conditionName: "OHC 6",
        descriptionName: "LIFT_UP_END4",
        condition: { from: "0", to: "1" }
    },
    "X0226": {
        conditionName: "OHC 6",
        descriptionName: "COLLISION",
        condition: { from: "0", to: "1" }
    },
    "X0236": {
        conditionName: "OHC 6",
        descriptionName: "LIFT_UP_OVERRUN",
        condition: { from: "0", to: "1" }
    },
    "X0246": {
        conditionName: "OHC 6",
        descriptionName: "LIFT_UP_END 5",
        condition: { from: "0", to: "1" }
    },
    "X0256": {
        conditionName: "OHC 6",
        descriptionName: "LIFT_DOWN_OVERRUN",
        condition: { from: "1", to: "0" }
    },
    "X0266": {
        conditionName: "OHC 6",
        descriptionName: "HANGER_ARM_L_OPEN_END",
        condition: { from: "1", to: "0" }
    },
    "X0276": {
        conditionName: "OHC 6",
        descriptionName: "HANGER_ARM_L_CLOSED_END",
        condition: { from: "0", to: "1" }
    },
    "X0286": {
        conditionName: "OHC 6",
        descriptionName: "HANGER_ARM_R_OPEN_END",
        condition: { from: "1", to: "0" }
    },
    "X0296": {
        conditionName: "OHC 6",
        descriptionName: "HANGER_ARM_R_CLOSED_END",
        condition: { from: "0", to: "1" }
    },
    "X02A6": {
        conditionName: "OHC 6",
        descriptionName: "LIFT_CHAIN_FAULT_FL",
        condition: { from: "0", to: "1" }
    },
    "X02B6": {
        conditionName: "OHC 6",
        descriptionName: "LIFT_CHAIN_FAULT_FR",
        condition: { from: "0", to: "1" }
    },
    "X02C6": {
        conditionName: "OHC 6",
        descriptionName: "LIFT_CHAIN_FAULT_RL",
        condition: { from: "0", to: "1" }
    },
    "X02D6": {
        conditionName: "OHC 6",
        descriptionName: "LIFT_CHAIN_FAULT_RR",
        condition: { from: "0", to: "1" }
    },
    "X02E6": {
        conditionName: "OHC 6",
        descriptionName: "spare",
        condition: { from: "0", to: "1" }
    },
    "X02F6": {
        conditionName: "OHC 6",
        descriptionName: "spare",
        condition: { from: "0", to: "1" }
    }
}

export default { cycleAsset, spConditionAsset, ohcConditionAsset, sensorCycleMapping, sensorConditionMapping }