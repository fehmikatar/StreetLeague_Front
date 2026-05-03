import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { TeamService } from '../../services/team.service';

function parseCurrentUserId(): number | null {
  const raw = localStorage.getItem('user_id');
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export const teamChatGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const teamService = inject(TeamService);

  const teamId = Number(route.paramMap.get('id'));
  if (!Number.isFinite(teamId) || teamId <= 0) {
    return router.createUrlTree(['/app/team']);
  }

  const currentUserId = parseCurrentUserId();
  const memberId = route.paramMap.get('memberId');
  const returnUrl = memberId
    ? `/app/team/${teamId}/chat/private/${memberId}`
    : `/app/team/${teamId}/chat`;

  if (!currentUserId) {
    return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl } });
  }

  // ✅ Utiliser getTeamMembers au lieu de getTeamDetails
  return teamService.getTeamMembers(teamId).pipe(
    map((members) => {
      // ✅ Comparer avec member.userId ou member.id
      const isMember = Array.isArray(members) && members.some((member: any) => (member.userId || member.id) === currentUserId);
      return isMember ? true : router.createUrlTree(['/app/team', teamId]);
    }),
    catchError(() => of(router.createUrlTree(['/app/team', teamId])))
  );
};
