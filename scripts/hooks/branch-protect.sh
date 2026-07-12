#!/bin/sh
# Block direct commits to protected branches.
branch=$(git rev-parse --abbrev-ref HEAD)
case " main master prod production staging " in
  *" $branch "*)
    echo "Error: Direct commits to $branch are not allowed."
    exit 1
    ;;
esac
