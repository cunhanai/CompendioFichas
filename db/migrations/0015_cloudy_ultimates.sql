CREATE TABLE "library_classes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"system_id" text NOT NULL,
	"name" text NOT NULL,
	"desc" text NOT NULL,
	"tag" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "library_classes" ADD CONSTRAINT "library_classes_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE cascade ON UPDATE no action;