import update from 'immutability-helper';
import * as types from '../actions/constants';

const initialState = [];

export default (state = initialState, action) => {
    switch (action.type) {
        case types.REMOVE_TABLE:
            // Drop all associated relations for this table
            return state.filter((relation) => (relation.source.tableId !== action.id) &&
                relation.target.tableId !== action.id);
        case types.REMOVE_COLUMN: {
            // Drop all associated relations for this column
            const columnId = action.columnData.id;

            return state.filter((relation) => (relation.source.columnId !== columnId &&
                relation.target.columnId !== columnId));
        }
        case types.SAVE_FOREIGN_KEY_RELATION:
            if (action.columnData.foreignKey.on.id) {
                return update(state, {
                    $push: [{
                        source: {
                            columnId: action.columnData.id,
                            tableId: action.tableId
                        },
                        target: {
                            columnId: action.columnData.foreignKey.references.id,
                            tableId: action.columnData.foreignKey.on.id
                        }
                    }]
                });
            }

            return state;
        case types.UPDATE_FOREIGN_KEY_RELATION: {
            const foreignKey = action.columnData.foreignKey;

            if (foreignKey.on.id) {
                let matched = false;
                const newState = state.map((relation) => {
                    if (relation.source.columnId === action.columnData.id) {
                        // Relation exists, so update it
                        matched = true;
                        return {
                            source: {
                                columnId: action.columnData.id,
                                tableId: action.tableId
                            },
                            target: {
                                columnId: action.columnData.foreignKey.references.id,
                                tableId: action.columnData.foreignKey.on.id
                            }
                        };
                    }

                    return relation;
                });

                if (matched) {
                    return newState;
                }

                return update(state, {
                    $push: [{
                        source: {
                            columnId: action.columnData.id,
                            tableId: action.tableId
                        },
                        target: {
                            columnId: action.columnData.foreignKey.references.id,
                            tableId: action.columnData.foreignKey.on.id
                        }
                    }]
                });
            }

            // Remove any relation referred by the current column
            return state.filter((relation) => (relation.source.columnId !== action.columnData.id));
        }
        default:
            return state;
    }
};
