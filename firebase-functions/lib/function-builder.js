"use strict";
// The MIT License (MIT)
//
// Copyright (c) 2017 Firebase
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionBuilder = exports.runWith = exports.region = void 0;
const _ = require("lodash");
const function_configuration_1 = require("./function-configuration");
const analytics = require("./providers/analytics");
const auth = require("./providers/auth");
const crashlytics = require("./providers/crashlytics");
const database = require("./providers/database");
const firestore = require("./providers/firestore");
const https = require("./providers/https");
const pubsub = require("./providers/pubsub");
const remoteConfig = require("./providers/remoteConfig");
const storage = require("./providers/storage");
const testLab = require("./providers/testLab");
/**
 * Assert that the runtime options passed in are valid.
 * @param runtimeOptions object containing memory and timeout information.
 * @throws { Error } Memory and TimeoutSeconds values must be valid.
 */
function assertRuntimeOptionsValid(runtimeOptions) {
    if (runtimeOptions.memory &&
        !_.includes(function_configuration_1.VALID_MEMORY_OPTIONS, runtimeOptions.memory)) {
        throw new Error(`The only valid memory allocation values are: ${function_configuration_1.VALID_MEMORY_OPTIONS.join(', ')}`);
    }
    if (runtimeOptions.timeoutSeconds > function_configuration_1.MAX_TIMEOUT_SECONDS ||
        runtimeOptions.timeoutSeconds < 0) {
        throw new Error(`TimeoutSeconds must be between 0 and ${function_configuration_1.MAX_TIMEOUT_SECONDS}`);
    }
    if (runtimeOptions.vpcConnectorEgressSettings &&
        !_.includes(function_configuration_1.VPC_EGRESS_SETTINGS_OPTIONS, runtimeOptions.vpcConnectorEgressSettings)) {
        throw new Error(`The only valid vpcConnectorEgressSettings values are: ${function_configuration_1.VPC_EGRESS_SETTINGS_OPTIONS.join(',')}`);
    }
    if (runtimeOptions.failurePolicy !== undefined) {
        if (_.isBoolean(runtimeOptions.failurePolicy) === false &&
            _.isObjectLike(runtimeOptions.failurePolicy) === false) {
            throw new Error(`failurePolicy must be a boolean or an object.`);
        }
        if (typeof runtimeOptions.failurePolicy === 'object') {
            if (_.isObjectLike(runtimeOptions.failurePolicy.retry) === false ||
                _.isEmpty(runtimeOptions.failurePolicy.retry) === false) {
                throw new Error('failurePolicy.retry must be an empty object.');
            }
        }
    }
    return true;
}
/**
 * Assert regions specified are valid.
 * @param regions list of regions.
 * @throws { Error } Regions must be in list of supported regions.
 */
function assertRegionsAreValid(regions) {
    if (!regions.length) {
        throw new Error('You must specify at least one region');
    }
    return true;
}
/**
 * Configure the regions that the function is deployed to.
 * @param regions One of more region strings.
 * @example
 * functions.region('us-east1')
 * @example
 * functions.region('us-east1', 'us-central1')
 */
function region(...regions) {
    if (assertRegionsAreValid(regions)) {
        return new FunctionBuilder({ regions });
    }
}
exports.region = region;
/**
 * Configure runtime options for the function.
 * @param runtimeOptions Object with optional fields:
 * 1. memory: amount of memory to allocate to the function, possible values
 *    are: '128MB', '256MB', '512MB', '1GB', and '2GB'.
 * 2. timeoutSeconds: timeout for the function in seconds, possible values are
 *    0 to 540.
 * 3. failurePolicy: failure policy of the function, with boolean `true` being
 *    equivalent to providing an empty retry object.
 * 4. vpcConnector: id of a VPC connector in same project and region
 * 5. vpcConnectorEgressSettings: when a vpcConnector is set, control which
 *    egress traffic is sent through the vpcConnector.
 *
 * Value must not be null.
 */
function runWith(runtimeOptions) {
    if (assertRuntimeOptionsValid(runtimeOptions)) {
        return new FunctionBuilder(runtimeOptions);
    }
}
exports.runWith = runWith;
class FunctionBuilder {
    constructor(options) {
        this.options = options;
    }
    /**
     * Configure the regions that the function is deployed to.
     * @param regions One or more region strings.
     * @example
     * functions.region('us-east1')
     * @example
     * functions.region('us-east1', 'us-central1')
     */
    region(...regions) {
        if (assertRegionsAreValid(regions)) {
            this.options.regions = regions;
            return this;
        }
    }
    /**
     * Configure runtime options for the function.
     * @param runtimeOptions Object with three optional fields:
     * 1. failurePolicy: failure policy of the function, with boolean `true` being
     *    equivalent to providing an empty retry object.
     * 2. memory: amount of memory to allocate to the function, with possible
     *    values being '128MB', '256MB', '512MB', '1GB', and '2GB'.
     * 3. timeoutSeconds: timeout for the function in seconds, with possible
     *    values being 0 to 540.
     *
     * Value must not be null.
     */
    runWith(runtimeOptions) {
        if (assertRuntimeOptionsValid(runtimeOptions)) {
            this.options = _.assign(this.options, runtimeOptions);
            return this;
        }
    }
    get https() {
        if (this.options.failurePolicy !== undefined) {
            console.warn('RuntimeOptions.failurePolicy is not supported in https functions.');
        }
        return {
            /**
             * Handle HTTP requests.
             * @param handler A function that takes a request and response object,
             * same signature as an Express app.
             */
            onRequest: (handler) => https._onRequestWithOptions(handler, this.options),
            /**
             * Declares a callable method for clients to call using a Firebase SDK.
             * @param handler A method that takes a data and context and returns a value.
             */
            onCall: (handler) => https._onCallWithOptions(handler, this.options),
        };
    }
    get database() {
        return {
            /**
             * Selects a database instance that will trigger the function. If omitted,
             * will pick the default database for your project.
             * @param instance The Realtime Database instance to use.
             */
            instance: (instance) => database._instanceWithOptions(instance, this.options),
            /**
             * Select Firebase Realtime Database Reference to listen to.
             *
             * This method behaves very similarly to the method of the same name in
             * the client and Admin Firebase SDKs. Any change to the Database that
             * affects the data at or below the provided `path` will fire an event in
             * Cloud Functions.
             *
             * There are three important differences between listening to a Realtime
             * Database event in Cloud Functions and using the Realtime Database in
             * the client and Admin SDKs:
             * 1. Cloud Functions allows wildcards in the `path` name. Any `path`
             *    component in curly brackets (`{}`) is a wildcard that matches all
             *    strings. The value that matched a certain invocation of a Cloud
             *    Function is returned as part of the `context.params` object. For
             *    example, `ref("messages/{messageId}")` matches changes at
             *    `/messages/message1` or `/messages/message2`, resulting in
             *    `context.params.messageId` being set to `"message1"` or
             *    `"message2"`, respectively.
             * 2. Cloud Functions do not fire an event for data that already existed
             *    before the Cloud Function was deployed.
             * 3. Cloud Function events have access to more information, including
             *    information about the user who triggered the Cloud Function.
             * @param ref Path of the database to listen to.
             */
            ref: (path) => database._refWithOptions(path, this.options),
        };
    }
    get firestore() {
        return {
            /**
             * Select the Firestore document to listen to for events.
             * @param path Full database path to listen to. This includes the name of
             * the collection that the document is a part of. For example, if the
             * collection is named "users" and the document is named "Ada", then the
             * path is "/users/Ada".
             */
            document: (path) => firestore._documentWithOptions(path, this.options),
            /** @hidden */
            namespace: (namespace) => firestore._namespaceWithOptions(namespace, this.options),
            /** @hidden */
            database: (database) => firestore._databaseWithOptions(database, this.options),
        };
    }
    get crashlytics() {
        return {
            /**
             * Handle events related to Crashlytics issues. An issue in Crashlytics is
             * an aggregation of crashes which have a shared root cause.
             */
            issue: () => crashlytics._issueWithOptions(this.options),
        };
    }
    get analytics() {
        return {
            /**
             * Select analytics events to listen to for events.
             * @param analyticsEventType Name of the analytics event type.
             */
            event: (analyticsEventType) => analytics._eventWithOptions(analyticsEventType, this.options),
        };
    }
    get remoteConfig() {
        return {
            /**
             * Handle all updates (including rollbacks) that affect a Remote Config
             * project.
             * @param handler A function that takes the updated Remote Config template
             * version metadata as an argument.
             */
            onUpdate: (handler) => remoteConfig._onUpdateWithOptions(handler, this.options),
        };
    }
    get storage() {
        return {
            /**
             * The optional bucket function allows you to choose which buckets' events
             * to handle. This step can be bypassed by calling object() directly,
             * which will use the default Cloud Storage for Firebase bucket.
             * @param bucket Name of the Google Cloud Storage bucket to listen to.
             */
            bucket: (bucket) => storage._bucketWithOptions(this.options, bucket),
            /**
             * Handle events related to Cloud Storage objects.
             */
            object: () => storage._objectWithOptions(this.options),
        };
    }
    get pubsub() {
        return {
            /**
             * Select Cloud Pub/Sub topic to listen to.
             * @param topic Name of Pub/Sub topic, must belong to the same project as
             * the function.
             */
            topic: (topic) => pubsub._topicWithOptions(topic, this.options),
            schedule: (schedule) => pubsub._scheduleWithOptions(schedule, this.options),
        };
    }
    get auth() {
        return {
            /**
             * Handle events related to Firebase authentication users.
             */
            user: () => auth._userWithOptions(this.options),
        };
    }
    get testLab() {
        return {
            /**
             * Handle events related to Test Lab test matrices.
             */
            testMatrix: () => testLab._testMatrixWithOpts(this.options),
        };
    }
}
exports.FunctionBuilder = FunctionBuilder;