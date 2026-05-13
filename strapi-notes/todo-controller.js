"use strict";

/**
 * todo controller — overrides the default Strapi CRUD to enforce
 * that todos are always scoped to the authenticated user.
 *
 * This implements the Bonus Challenge: "Strict Backend Policy"
 * The user is derived from ctx.state.user (JWT), never trusted from frontend.
 *
 * File location in your Strapi project:
 *   src/api/todo/controllers/todo.js
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::todo.todo", ({ strapi }) => ({
  /**
   * GET /api/todos
   * Returns only todos belonging to the authenticated user.
   */
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized("You must be logged in.");

    // Force filter to current user — ignore any filters from frontend
    ctx.query.filters = {
      ...ctx.query.filters,
      user: { id: { $eq: user.id } },
    };

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  /**
   * GET /api/todos/:id
   * Returns a single todo only if it belongs to the authenticated user.
   */
  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized("You must be logged in.");

    const { data, meta } = await super.findOne(ctx);

    // Check ownership
    const ownerId = data?.attributes?.user?.data?.id;
    if (ownerId && ownerId !== user.id) {
      return ctx.forbidden("You do not have access to this resource.");
    }

    return { data, meta };
  },

  /**
   * POST /api/todos
   * Creates a todo and automatically assigns it to the authenticated user.
   * Ignores any `user` field sent from the frontend.
   */
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized("You must be logged in.");

    // Override user from JWT — never trust frontend
    ctx.request.body.data = {
      ...ctx.request.body.data,
      user: user.id,
    };

    const { data, meta } = await super.create(ctx);
    return { data, meta };
  },

  /**
   * PUT /api/todos/:id
   * Updates a todo only if it belongs to the authenticated user.
   */
  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized("You must be logged in.");

    // Verify ownership before updating
    const existing = await strapi.entityService.findOne(
      "api::todo.todo",
      ctx.params.id,
      { populate: ["user"] }
    );

    if (!existing) return ctx.notFound("Todo not found.");
    if (existing.user?.id !== user.id) {
      return ctx.forbidden("You do not have permission to update this todo.");
    }

    // Prevent changing the user field
    if (ctx.request.body.data) {
      delete ctx.request.body.data.user;
    }

    const { data, meta } = await super.update(ctx);
    return { data, meta };
  },

  /**
   * DELETE /api/todos/:id
   * Deletes a todo only if it belongs to the authenticated user.
   */
  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized("You must be logged in.");

    // Verify ownership before deleting
    const existing = await strapi.entityService.findOne(
      "api::todo.todo",
      ctx.params.id,
      { populate: ["user"] }
    );

    if (!existing) return ctx.notFound("Todo not found.");
    if (existing.user?.id !== user.id) {
      return ctx.forbidden("You do not have permission to delete this todo.");
    }

    const { data, meta } = await super.delete(ctx);
    return { data, meta };
  },
}));
