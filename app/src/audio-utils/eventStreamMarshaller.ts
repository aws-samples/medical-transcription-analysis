import { EventStreamMarshaller } from '@aws-sdk/eventstream-marshaller'; // for converting binary event stream messages to and from JSON
import { toUtf8, fromUtf8 } from '@aws-sdk/util-utf8-node'; // utilities for encoding and decoding UTF8

export default new EventStreamMarshaller(toUtf8, fromUtf8);
