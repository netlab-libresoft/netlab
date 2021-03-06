/**
 *
 *  Copyright (C) 2012 GSyC/LibreSoft, Universidad Rey Juan Carlos.
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 */

/**
 * Netlab Module
 */
var Netlab = (function () {

  var module = {};

  /**
   * Editor is the main interface that specific classes should implement in
   * order to keep the same functionality although the widget changes. This is
   * done to enable to display the most suitable editor component on small devices
   * such as smartphones and tablets or more complex ones such as personal
   * computers.
   */
  module.EditorInterface = {
    /**
     * This method adds a kind of node specified by "type" with name "name" in a
     * certain position.
     * @param {String} type
     *   It has to be one of the next supported types: "pc", "router", "switch"
     *   or "hub".
     * @param {String} name
     * @param {Object} position
     *   It should contain x and y attributes.
     * Return True if the node was added and False in other case.
     */
    addNode: function(type, name, position) {},

    /**
     * This function deletes a node from the editor.
     * @param {String} name
     */
    removeNode: function(name) {},

    /**
     * This function adds a new connection between two nodes. Paramaters
     * provided in for the connection are in the next way:
     * Object = {
     *   name: "name",
     *   iface: "ethX"
     * }
     *
     * If interface is not relevant, "any" value should be set.
     *
     * @param {Object} node1
     * @param {Object} node2
     * return True if connection could be added, False in other case.
     */
    addConnection: function(node1, node2) {},

    /**
     * Get an array containing all nodes in the scene. Each position is an
     * object wich has next fields:
     * {
     *   name: "name",
     *   type: "type",
     *   posistion: {
     *     x: xval,
     *     y: yval
     *   }
     * }
     */
    getNodes: function() {},

    /**
     * Get an array containing all connections. Each position in this array is
     * an object which has the two nodes and theis interfaces:
     * {
     *   node1: {
     *     name: "node1",
     *     iface: "ethX"
     *   },
     *   node2: {
     *     name: "node2",
     *     iface: "ethX"
     *   }
     * }
     */
    getConnections: function() {}
  };

  module.ManagementInterface = {
    /**
     * Set the state "state" to the node identifies by "name"
     * state can be either: "started" or "halted".
     */
    setState: function(name, state) {},

    /**
     * Set the new ip address to the node identified by "name" on the interface "iface".
     */
    setIP: function(name, iface, ip) {},

    /**
     * Draws an smal shell icon on the node when a shell is connected to this node.
     * Deletes the shell icon when the shell is disconnected.
     */
    setShellState: function(name, state) {}
  };

  var supportedNodes = ["pc", "router", "switch", "hub"];

  /**
   * Simple test function to ensure that certain object implements any interface
   */
  function implements(obj, interface) {
    for (var method in interface) {
      if (obj[method] && typeof(obj[method]) == "function")
        continue;

      return false;
    }

    return true;
  };

  function addNodes (editor, sceneObj) {
    if (!sceneObj.nodes)
      throw("Missing nodes field");

    for(var index = 0; index < sceneObj.nodes.length; index++) {
      var node = sceneObj.nodes[index];

      /* Some basic checks */
      if (!(node.name) || typeof(node.name) != 'string')
        throw("Invalid node name");

      if (!(node.type) || typeof(node.type) != 'string'
                                      || supportedNodes.indexOf(node.type) < 0)
        throw("Invalid node type");

      if (!(node.position))
        throw("Missing node position");

      if (!(node.position.x) || typeof(node.position.x) != 'number')
        throw("Invalid node position format");

      if (!(node.position.y) || typeof(node.position.y) != 'number')
        throw("Invalid node position format");

      if (!editor.addNode(node.type, node.name, node.position))
        throw("Node " + node.name + " could not be added");
    }
  };

  function addConnections (editor, sceneObj) {
    if (!sceneObj.connections)
      throw("Missing connections field");

    for(var index = 0; index < sceneObj.connections.length; index++) {
      var conn = sceneObj.connections[index];
      var ifaceMatch = /^eth(0|[1-9][0-9]*$)/;

      /* Some basic checks */
      if (!conn.node1)
        throw("Missing node1 in the connection");

      if (!(conn.node1.name) || typeof(conn.node1.name) != 'string')
        throw("Missing node name in the connection");

      if (!(conn.node1.iface) || typeof(conn.node1.iface) != 'string')
        throw("Missing node interface in the connection");

      if (!ifaceMatch.test(conn.node1.iface))
        throw("Invalid interface [" + conn.node1.iface + "] in node "
                                                            + conn.node1.name);

      if (!conn.node2)
        throw("Missing node2 in connection");

      if (!(conn.node2.name) || typeof(conn.node2.name) != 'string')
        throw("Missing node name in the connection");

      if (!(conn.node2.iface) || typeof(conn.node2.iface) != 'string')
        throw("Missing node interface in the connection");

      if (!ifaceMatch.test(conn.node2.iface))
        throw("Invalid interface [" + conn.node2.iface + "] in node "
                                                            + conn.node2.name);

      if (!editor.addConnection({
              name: conn.node1.name,
              iface: conn.node1.iface
            }, {
              name: conn.node2.name,
              iface: conn.node2.iface
            }))
        throw("Can not connect " + conn.node1.name + "[" + conn.node1.iface
                  + "] with " + conn.node2.name + "[" + conn.node2.iface + "]");
    }
  };

  /**
   * Next function loads an scene from a JSON
   * @param {Object} editor
   *   Object implementing the EditorInterface
   * @param {String} json
   */
  module.loadJSON = function(editor, json) {
    if (!implements(editor, module.EditorInterface))
      throw ("Not editor object provided");

    var sceneObj = JSON.parse(json);

    addNodes(editor, sceneObj);
    addConnections(editor, sceneObj);
  };

  /**
   * Next function generates the json format representing the scene
   * @param {Object} editor
   *   Object implementing the EditorInterface
   * @return {String} json
   */
  module.getJSON = function(editor) {
    if (!implements(editor, module.EditorInterface))
      throw ("Not editor object provided");

    var sceneObj = {
      nodes: editor.getNodes(),
      connections: editor.getConnections()
    };

    return JSON.stringify(sceneObj, null, 2);
  };


  function getNodeByName (name, nodes) {
    for(var index = 0; index < nodes.length; index++) {
      if (name == nodes[index].name)
        return nodes[index];
    }
    return null;
  };

  function sameNodes (node1, node2) {
    return ((node1.name == node2.name) &&
            (node1.type == node2.type) &&
            (node1.position.x == node2.position.x) &&
            (node1.position.y == node2.position.y))
  };

  function sameConnection(conn1, conn2) {
    if (conn1.node1.name == conn2.node1.name)
      return ((conn1.node1.iface == conn2.node1.iface) &&
              (conn1.node2.name == conn2.node2.name) &&
              (conn1.node2.iface == conn2.node2.iface))
    else
      return ((conn1.node1.name == conn2.node2.name) &&
              (conn1.node1.iface == conn2.node2.iface) &&
              (conn1.node2.name == conn2.node1.name) &&
              (conn1.node2.iface == conn2.node1.iface))
  };

  function getConnectionByLink (connection, connections) {
    for(var index = 0; index < connections.length; index++) {
      var conn = connections[index];

      if (sameConnection(connection, conn))
        return conn;
    }

    return null;
  };

  /**
   * Next function compares two scenes represented by a JSON
   * @return true if both scenes are equal
   */
  module.sameScenes = function(scene1, scene2) {
    var sceneObj1 = JSON.parse(scene1);
    var sceneObj2 = JSON.parse(scene2);

    if ((sceneObj1.nodes.length != sceneObj2.nodes.length) ||
        (sceneObj1.connections.length != sceneObj2.connections.length))
      return false;

    /* Compare nodes */
    for(var index = 0; index < sceneObj1.nodes.length; index++) {
      var node1 = sceneObj1.nodes[index];
      var node2 = getNodeByName(node1.name, sceneObj2.nodes);

      if (!node2)
        return false;

      if (!sameNodes(node1, node2))
        return false;
    }

    /* Compare connections */
    for(var index = 0; index < sceneObj1.connections.length; index++) {
      var conn1 = sceneObj1.connections[index];

      if (!getConnectionByLink(conn1, sceneObj2.connections))
        return false;
    }

    return true;
  };

  return module;

}());
