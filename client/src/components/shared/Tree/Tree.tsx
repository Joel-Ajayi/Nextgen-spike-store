import React, { useMemo, useState } from "react";
import { ITreeNode } from "../../../types";
import { Tree as ReactTree, hierarchy } from "@visx/hierarchy";
import { LinkHorizontal } from "@visx/shape";
import { Group } from "@visx/group";
import { ReactComponent as MoveIcon } from "../../../images/icons/redo.svg";
import { ReactComponent as AddIcon } from "../../../images/icons/add.svg";
import { ReactComponent as EditIcon } from "../../../images/icons/edit.svg";
import uniqid from "uniqid";
import styles from "./tree.module.scss";
import SpinLoader from "../Loader/SpinLoader/SpinLoader";

type TreeProps = {
  width: number;
  height: number;
  nodeWidth: number;
  nodeHeight: number;
  rawTree: ITreeNode;
  onMove?: (id: string, destId: string) => Promise<void>;
  onAppend?: (id: string) => void;
  onEdit?: (id: string) => void;
};

function Tree({
  rawTree,
  height,
  width,
  nodeWidth,
  onMove,
  onAppend,
  onEdit,
}: TreeProps) {
  const [moveNode, setMoveNode] = useState<ITreeNode | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  const onMoveFunc = async (destId: string) => {
    if (onMove) {
      setIsMoving(true);
      await onMove(moveNode?.id as string, destId);
      setMoveNode(null);
      setIsMoving(false);
    }
  };

  const initMove = (item: ITreeNode) => {
    setMoveNode(item);
  };

  const appendToNode = async (id: string) => {
    if (onAppend) onAppend(id);
  };

  const editNode = async (id: string) => {
    if (onEdit) onEdit(id);
  };

  const margin = { top: 25, left: 100, right: 120, bottom: 25 };
  const data = useMemo(() => hierarchy(rawTree), [rawTree]);
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;

  const nodeHeight = 45;
  const centerX = -nodeWidth / 2;
  const centerY = -nodeHeight / 2 - 7.5;

  const lightpurple = "#374469";

  return (
    <div
      className={styles.tree}
      style={{ overflow: isMoving ? "hidden" : "auto" }}
    >
      {isMoving && (
        <div className={styles.spinner}>
          <SpinLoader />
        </div>
      )}
      <svg width={width} height={height}>
        <ReactTree<ITreeNode> root={data} size={[yMax, xMax]}>
          {(tree) => (
            <Group top={margin.top} left={margin.left}>
              {tree.links().map((link, i) => (
                <LinkHorizontal
                  key={`link-${i}`}
                  data={link}
                  stroke={lightpurple}
                  strokeWidth="1"
                  fill="none"
                />
              ))}
              {tree.descendants().map((node, i) => (
                <Group top={node.x} left={node.y} key={uniqid()}>
                  <foreignObject
                    height={nodeHeight}
                    width={nodeWidth}
                    y={centerY}
                    x={centerX}
                    style={{ position: "relative" }}
                  >
                    <div className={styles.action_buttons}>
                      {node.depth === 0 && (
                        <AddIcon
                          onClick={() => appendToNode(node.data.id)}
                          className={styles.add_icon}
                        />
                      )}
                      {node.depth !== 0 && (
                        <>
                          {node.data.appendable && !moveNode && (
                            <AddIcon
                              onClick={() => appendToNode(node.data.id)}
                              className={styles.add_icon}
                            />
                          )}
                          {!moveNode && (
                            <EditIcon
                              onClick={() => editNode(node.data.id)}
                              className={styles.edit_icon}
                            />
                          )}
                          {!!moveNode &&
                            moveNode?.level - 1 === node.data.level &&
                            node.data.appendable &&
                            !!onMove && (
                              <input
                                type="checkbox"
                                onChange={() => onMoveFunc(node.data.id)}
                              />
                            )}
                          {node.data.moveable && !moveNode && (
                            <MoveIcon
                              onClick={() => initMove(node.data)}
                              className={styles.move_icon}
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div
                      data-xmlns="http://www.w3.org/1999/xhtml"
                      className={styles.category}
                    >
                      {node.data.name}
                    </div>
                  </foreignObject>
                </Group>
              ))}
            </Group>
          )}
        </ReactTree>
      </svg>
    </div>
  );
}

export default Tree;
