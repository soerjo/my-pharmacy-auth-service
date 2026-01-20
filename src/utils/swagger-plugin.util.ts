interface SwaggerSystem {
  fn: {
    opsFilter: (taggedOps: unknown[], phrase: string) => unknown[];
  };
}

interface TagObj {
  _root: {
    entries: [string, unknown[]][];
  };
}

export const AdvancedFilterPlugin = function (system: SwaggerSystem) {
  return {
    fn: {
      opsFilter: function (taggedOps, phrase) {
        phrase = phrase.toLowerCase();
        const filteredActions = taggedOps.map((tagObj: TagObj) => {
          tagObj._root.entries[1][1] = tagObj._root.entries[1][1].filter((operationObj) => {
            const op = JSON.parse(JSON.stringify(operationObj));
            let summary = '';
            let description = '';
            if (typeof op.operation.summary !== 'undefined') {
              summary = JSON.stringify(op.operation.summary).toLowerCase();
            }
            if (typeof op.operation.description !== 'undefined') {
              description = JSON.stringify(op.operation.description).toLowerCase();
            }
            if (
              op.path.toLowerCase().indexOf(phrase) === -1 &&
              summary.indexOf(phrase) === -1 &&
              description.indexOf(phrase) === -1
            ) {
              return false;
            } else {
              return true;
            }
          });
          return tagObj;
        });
        return filteredActions.filter((tagObj: TagObj) => {
          return tagObj._root.entries[1][1].length > 0;
        });
      },
    },
  };
};
