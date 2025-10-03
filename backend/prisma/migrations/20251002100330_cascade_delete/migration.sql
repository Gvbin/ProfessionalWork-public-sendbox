-- DropForeignKey
ALTER TABLE "public"."Board" DROP CONSTRAINT "Board_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Card" DROP CONSTRAINT "Card_listId_fkey";

-- DropForeignKey
ALTER TABLE "public"."List" DROP CONSTRAINT "List_boardId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Board" ADD CONSTRAINT "Board_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."List" ADD CONSTRAINT "List_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "public"."Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_listId_fkey" FOREIGN KEY ("listId") REFERENCES "public"."List"("id") ON DELETE CASCADE ON UPDATE CASCADE;
