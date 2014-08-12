'use strict';

module mock {

    export class GuidMock {

        private count = 0;

        /** Create an unique identifier */
        public create(prefix: string) {
            return (prefix || '') + (this.count++);
        }
    }

    angular.module('jat.services.guid.mock', [])
        .service('guid', GuidMock);
} 