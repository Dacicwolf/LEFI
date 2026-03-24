import React from "react";
import PullToRefresh from "react-simple-pull-to-refresh";

const Spinner = () => (
  <div className="flex justify-center py-2">
    <div className="w-5 h-5 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
  </div>
);

/**
 * Shared pull-to-refresh wrapper. Pass `onRefresh` returning a Promise.
 * Renders nothing extra — just wraps children with PTR behaviour.
 */
export default function PullToRefreshWrapper({ onRefresh, children }) {
  return (
    <PullToRefresh onRefresh={onRefresh} pullingContent={<Spinner />}>
      {children}
    </PullToRefresh>
  );
}