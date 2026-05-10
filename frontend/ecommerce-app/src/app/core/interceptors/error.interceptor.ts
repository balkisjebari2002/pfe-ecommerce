import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snack = inject(MatSnackBar);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let message = 'Une erreur est survenue.';
      if (err.error?.error) message = err.error.error;
      else if (err.status === 0) message = 'Impossible de joindre le serveur.';
      else if (err.status === 403) message = 'Accès refusé.';
      else if (err.status === 404) message = 'Ressource introuvable.';
      snack.open(message, 'Fermer', { duration: 4000 });
      return throwError(() => err);
    })
  );
};
