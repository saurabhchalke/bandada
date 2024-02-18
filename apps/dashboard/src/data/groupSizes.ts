import { GroupSize } from "../types"

const groupSizes: GroupSize[] = [
    {
        name: "Small",
        description: "Startups, small communities, teams",
        capacity: "Up to 65k sensors",
        useCases: [
            "Schools/Universities",
            "Startup prototypes",
            "MSMEs",
        ],
        treeDepth: 16
    },
    {
        name: "Medium",
        description: "Cities and companies",
        capacity: "Up to 1M sensors",
        useCases: [
            "Sensors for the whole city",
            "Large companies",
        ],
        treeDepth: 20
    },
    {
        name: "Large",
        description: "Cities, mega-corporations, countries",
        capacity: "Up to 33M sensors",
        useCases: [
            "Large cities",
            "Nation states",
            "Mega corporations",
        ],
        treeDepth: 25
    },
]

export default groupSizes
